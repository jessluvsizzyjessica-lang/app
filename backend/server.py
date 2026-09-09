import os
import uuid
import json
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File, Form
from fastapi.responses import Response
from fastapi.concurrency import run_in_threadpool
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.llm.chat import LlmChat, UserMessage

from seed_data import SEED_RECIPES, SEED_GARNISHES, SEED_SYRUPS
from bar_math import compute_shopping_list, compute_batch, scale_syrup, POURS_PER_GALLON

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
TOKEN_DAYS = 30
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "mobile-mixery"
_storage_key = None

app = FastAPI()
api = APIRouter(prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: Optional[str] = Field(default=None, max_length=80)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class EventCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    date: Optional[str] = None
    vibe: Optional[str] = Field(default=None, max_length=120)
    guest_count: Optional[int] = None
    notes: Optional[str] = Field(default=None, max_length=1000)


class EventUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[str] = None
    vibe: Optional[str] = None
    guest_count: Optional[int] = None
    notes: Optional[str] = None


class MenuItem(BaseModel):
    recipe_id: Optional[str] = None
    name: str
    category: str = "Cocktails"
    image_url: Optional[str] = None
    garnish: Optional[str] = None


class AIGenerateBody(BaseModel):
    event_description: str = Field(min_length=3, max_length=1000)
    guest_count: Optional[int] = None
    vibe: Optional[str] = None


class ShoppingBody(BaseModel):
    guests: int = Field(ge=1, le=2000)
    drinks_per_guest: float = Field(default=2.0, ge=0.5, le=20)
    recipe_ids: List[str] = Field(min_length=1)


class BatchBody(BaseModel):
    recipe_id: str
    servings: int = Field(ge=1, le=2000)


class SyrupScaleBody(BaseModel):
    syrup_id: str
    multiplier: int = Field(default=1, ge=1, le=20)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def make_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    claims = {"sub": user_id, "iat": now, "exp": now + timedelta(days=TOKEN_DAYS)}
    return jwt.encode(claims, JWT_SECRET, algorithm=JWT_ALG)


def public_user(u: dict) -> dict:
    return {"id": u["_id"], "email": u["email"], "name": u.get("name")}


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Object storage helpers (sync -> run_in_threadpool)
# ---------------------------------------------------------------------------
def _init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _put_object(path: str, data: bytes, content_type: str) -> dict:
    key = _init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def _get_object(path: str):
    global _storage_key
    key = _init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 503:
        _storage_key = None
        key = _init_storage()
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Routes: Auth
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"message": "The Mobile Mixery API"}


@api.post("/auth/register")
async def register(body: Credentials):
    email = body.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = {
        "_id": str(uuid.uuid4()),
        "email": email,
        "name": body.name or email.split("@")[0],
        "password_hash": hash_password(body.password),
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    return {"access_token": make_token(user["_id"]), "user": public_user(user)}


@api.post("/auth/login")
async def login(body: LoginBody):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": make_token(user["_id"]), "user": public_user(user)}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return public_user(user)


@api.delete("/auth/me", status_code=204)
async def delete_account(user=Depends(get_current_user)):
    """Permanently delete the authenticated user and all associated data
    (Apple App Store review requirement). User is derived from the verified
    JWT, never from the client."""
    uid = user["_id"]
    await db.favorites.delete_many({"user_id": uid})
    await db.events.delete_many({"user_id": uid})
    await db.uploads.delete_many({"user_id": uid})
    await db.custom_photos.delete_many({"user_id": uid})
    await db.users.delete_one({"_id": uid})
    return Response(status_code=204)


# ---------------------------------------------------------------------------
# Routes: Recipes & Garnishes (public)
# ---------------------------------------------------------------------------
@api.get("/recipes")
async def list_recipes(category: Optional[str] = None, q: Optional[str] = None):
    query: dict = {}
    if category and category.lower() != "all":
        query["category"] = category
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    docs = await db.recipes.find(query, {"_id": 0}).to_list(500)
    return docs


@api.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: str):
    doc = await db.recipes.find_one({"id": recipe_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Recipe not found")
    photos = await db.custom_photos.find({"recipe_id": recipe_id}, {"_id": 0}).to_list(50)
    doc["custom_photos"] = [p["url"] for p in photos]
    return doc


@api.get("/garnishes")
async def list_garnishes():
    docs = await db.garnishes.find({}, {"_id": 0}).to_list(100)
    return docs


@api.get("/categories")
async def categories():
    cats = await db.recipes.distinct("category")
    return ["All"] + sorted(cats)


# ---------------------------------------------------------------------------
# Routes: Favorites (auth)
# ---------------------------------------------------------------------------
@api.get("/favorites")
async def get_favorites(user=Depends(get_current_user)):
    favs = await db.favorites.find({"user_id": user["_id"]}, {"_id": 0}).to_list(500)
    ids = [f["recipe_id"] for f in favs]
    recipes = await db.recipes.find({"id": {"$in": ids}}, {"_id": 0}).to_list(500)
    return recipes


@api.get("/favorites/ids")
async def get_favorite_ids(user=Depends(get_current_user)):
    favs = await db.favorites.find({"user_id": user["_id"]}, {"_id": 0}).to_list(500)
    return [f["recipe_id"] for f in favs]


@api.post("/favorites/{recipe_id}")
async def add_favorite(recipe_id: str, user=Depends(get_current_user)):
    await db.favorites.update_one(
        {"user_id": user["_id"], "recipe_id": recipe_id},
        {"$set": {"user_id": user["_id"], "recipe_id": recipe_id, "created_at": now_iso()}},
        upsert=True,
    )
    return {"saved": True, "recipe_id": recipe_id}


@api.delete("/favorites/{recipe_id}")
async def remove_favorite(recipe_id: str, user=Depends(get_current_user)):
    await db.favorites.delete_one({"user_id": user["_id"], "recipe_id": recipe_id})
    return {"saved": False, "recipe_id": recipe_id}


# ---------------------------------------------------------------------------
# Routes: Events / Menus (auth)
# ---------------------------------------------------------------------------
@api.get("/events")
async def list_events(user=Depends(get_current_user)):
    docs = await db.events.find(
        {"user_id": user["_id"], "deleted_at": None}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return docs


@api.post("/events")
async def create_event(body: EventCreate, user=Depends(get_current_user)):
    event = {
        "id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "name": body.name,
        "date": body.date,
        "vibe": body.vibe,
        "guest_count": body.guest_count,
        "notes": body.notes,
        "items": [],
        "created_at": now_iso(),
        "deleted_at": None,
    }
    await db.events.insert_one(dict(event))
    event.pop("_id", None)
    return event


@api.get("/events/{event_id}")
async def get_event(event_id: str, user=Depends(get_current_user)):
    doc = await db.events.find_one({"id": event_id, "user_id": user["_id"], "deleted_at": None}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    return doc


@api.put("/events/{event_id}")
async def update_event(event_id: str, body: EventUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if updates:
        await db.events.update_one({"id": event_id, "user_id": user["_id"]}, {"$set": updates})
    return await get_event(event_id, user)


@api.delete("/events/{event_id}")
async def delete_event(event_id: str, user=Depends(get_current_user)):
    await db.events.update_one(
        {"id": event_id, "user_id": user["_id"]}, {"$set": {"deleted_at": now_iso()}}
    )
    return {"deleted": True}


@api.post("/events/{event_id}/items")
async def add_item(event_id: str, item: MenuItem, user=Depends(get_current_user)):
    doc = await db.events.find_one({"id": event_id, "user_id": user["_id"], "deleted_at": None})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    entry = item.dict()
    entry["item_id"] = str(uuid.uuid4())
    await db.events.update_one({"id": event_id}, {"$push": {"items": entry}})
    return await get_event(event_id, user)


@api.delete("/events/{event_id}/items/{item_id}")
async def remove_item(event_id: str, item_id: str, user=Depends(get_current_user)):
    await db.events.update_one(
        {"id": event_id, "user_id": user["_id"]}, {"$pull": {"items": {"item_id": item_id}}}
    )
    return await get_event(event_id, user)


# ---------------------------------------------------------------------------
# Routes: AI generation
# ---------------------------------------------------------------------------
AI_SYSTEM = (
    "You are an expert mobile bartender and event mixologist for a company called The Mobile Mixery. "
    "Given an event brief, you design a cohesive, crowd-pleasing drink menu with creative combinations and "
    "fresh garnish ideas. Always respond with STRICT JSON only, no markdown, no commentary."
)


@api.post("/ai/generate-menu")
async def generate_menu(body: AIGenerateBody):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI is not configured")
    prompt = f"""Design a drink menu for this event.

Event: {body.event_description}
Guests: {body.guest_count or 'unspecified'}
Vibe: {body.vibe or 'unspecified'}

Return STRICT JSON with this exact shape:
{{
  "menu_title": "short catchy menu name",
  "summary": "1-2 sentence overview of the menu concept",
  "drinks": [
    {{
      "name": "drink name",
      "type": "Cocktail | Mocktail | Wine | Beer | Punch",
      "base_spirit": "main spirit or base",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "garnish": "garnish idea",
      "why": "one sentence on why it fits this event"
    }}
  ]
}}
Include 5 to 6 drinks with at least one mocktail. Keep it fresh, seasonal and elegant."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"menu-{uuid.uuid4()}",
        system_message=AI_SYSTEM,
    ).with_model("openai", "gpt-5.4")

    try:
        raw = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logger.exception("AI generation failed")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")

    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    try:
        data = json.loads(text)
    except Exception:
        raise HTTPException(status_code=502, detail="AI returned an unexpected format. Please try again.")
    return data


# ---------------------------------------------------------------------------
# Routes: Image upload / download
# ---------------------------------------------------------------------------
@api.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    recipe_id: Optional[str] = Form(default=None),
    user=Depends(get_current_user),
):
    content = await file.read()
    ext = (file.filename or "photo.jpg").rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp", "heic"):
        ext = "jpg"
    path = f"{APP_NAME}/uploads/{user['_id']}/{uuid.uuid4()}.{ext}"
    content_type = file.content_type or "image/jpeg"
    try:
        result = await run_in_threadpool(_put_object, path, content, content_type)
    except Exception as e:
        logger.exception("upload failed")
        raise HTTPException(status_code=502, detail=f"Upload failed: {e}")
    stored_path = result.get("path", path)
    url = f"/api/files/{stored_path}"
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "recipe_id": recipe_id,
        "storage_path": stored_path,
        "url": url,
        "content_type": content_type,
        "created_at": now_iso(),
    }
    await db.uploads.insert_one(dict(record))
    if recipe_id:
        await db.custom_photos.insert_one(
            {"user_id": user["_id"], "recipe_id": recipe_id, "url": url, "created_at": now_iso()}
        )
    record.pop("_id", None)
    return record


@api.get("/files/{path:path}")
async def get_file(path: str):
    try:
        content, content_type = await run_in_threadpool(_get_object, path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=content, media_type=content_type, headers={"Cache-Control": "public, max-age=86400"})


# ---------------------------------------------------------------------------
# Routes: Bar Tools (shopping list + batch) — public, deterministic math
# ---------------------------------------------------------------------------
@api.post("/tools/shopping-list")
async def shopping_list(body: ShoppingBody):
    recipes = await db.recipes.find({"id": {"$in": body.recipe_ids}}, {"_id": 0}).to_list(500)
    if not recipes:
        raise HTTPException(status_code=404, detail="No matching recipes found")

    total_drinks = int(round(body.guests * body.drinks_per_guest))
    n = len(recipes)
    base = total_drinks // n
    remainder = total_drinks % n

    per_recipe = []
    payload = []
    for i, r in enumerate(recipes):
        servings = base + (1 if i < remainder else 0)
        per_recipe.append({"id": r["id"], "name": r["name"], "servings": servings})
        payload.append({"name": r["name"], "servings": servings, "ingredients": r.get("ingredients", [])})

    result = compute_shopping_list(payload)
    return {
        "guests": body.guests,
        "drinks_per_guest": body.drinks_per_guest,
        "total_drinks": total_drinks,
        "per_recipe": per_recipe,
        **result,
    }


@api.post("/tools/batch")
async def batch(body: BatchBody):
    r = await db.recipes.find_one({"id": body.recipe_id}, {"_id": 0})
    if not r:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return compute_batch(r["name"], r.get("glass"), r.get("ingredients", []), body.servings)


@api.get("/syrups")
async def list_syrups():
    return await db.syrups.find({}, {"_id": 0}).to_list(100)


@api.get("/syrups/{syrup_id}")
async def get_syrup(syrup_id: str):
    doc = await db.syrups.find_one({"id": syrup_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Syrup not found")
    return doc


@api.post("/tools/syrup-scale")
async def syrup_scale(body: SyrupScaleBody):
    doc = await db.syrups.find_one({"id": body.syrup_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Syrup not found")
    return scale_syrup(doc, body.multiplier)


# ---------------------------------------------------------------------------
# Company info
# ---------------------------------------------------------------------------
@api.get("/company")
async def company():
    return {
        "name": "The Mobile Mixery",
        "tagline": "Craft cocktails, delivered to your event.",
        "website": "https://www.themobilemixeryca.com",
        "booking_url": "https://www.themobilemixeryca.com",
        "blurb": "Professional mobile bartending for weddings, corporate events and private parties across California.",
    }


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.favorites.create_index([("user_id", 1), ("recipe_id", 1)], unique=True)
    await db.events.create_index([("user_id", 1)])

    if await db.recipes.count_documents({}) == 0:
        await db.recipes.insert_many([dict(r) for r in SEED_RECIPES])
        logger.info("Seeded %d recipes", len(SEED_RECIPES))
    if await db.garnishes.count_documents({}) == 0:
        await db.garnishes.insert_many([dict(g) for g in SEED_GARNISHES])
        logger.info("Seeded %d garnishes", len(SEED_GARNISHES))
    if await db.syrups.count_documents({}) == 0:
        await db.syrups.insert_many([dict(s) for s in SEED_SYRUPS])
        logger.info("Seeded %d syrups", len(SEED_SYRUPS))

    try:
        await run_in_threadpool(_init_storage)
        logger.info("Object storage initialised")
    except Exception as e:
        logger.warning("Object storage init failed (uploads will retry): %s", e)


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
