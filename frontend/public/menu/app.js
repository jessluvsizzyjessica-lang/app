import { DRINKS, GALLERY, SWATCHES } from "./data.js";
import { GROUPS, emptyState, results, activeCount, chipCount } from "./filter.js";

/* Active selections + free-text query */
const active = emptyState();
let query = "";

/* ------------------------------------------------------------------
   DOM
------------------------------------------------------------------ */
const el = {
  gallery: document.getElementById("gallery"),
  menuCount: document.getElementById("menu-count"),
  drinkCount: document.getElementById("drink-count"),
  chipGroups: document.getElementById("chip-groups"),
  grid: document.getElementById("grid"),
  count: document.getElementById("count"),
  empty: document.getElementById("empty"),
  clear: document.getElementById("clear"),
  emptyClear: document.getElementById("empty-clear"),
  q: document.getElementById("q"),
  form: document.getElementById("inquiry-form"),
  formStatus: document.getElementById("form-status"),
  formDone: document.getElementById("inquiry-done"),
  lightbox: document.getElementById("lightbox"),
  lbImg: document.getElementById("lb-img"),
  lbTitle: document.getElementById("lb-title"),
  lbPours: document.getElementById("lb-pours"),
  lbPos: document.getElementById("lb-pos"),
  lbClose: document.getElementById("lb-close"),
  lbPrev: document.getElementById("lb-prev"),
  lbNext: document.getElementById("lb-next"),
};

/* ---------------------------  GALLERY  --------------------------- */

const MENU_DIR = "/menu/assets/menus/";
const img = (file) => MENU_DIR + file;

function renderGallery() {
  el.gallery.innerHTML = GALLERY.map(
    (m, i) => `
      <figure class="shot reveal" data-i="${i}" style="transition-delay:${Math.min(i, 9) * 60}ms">
        <button type="button" class="shot-btn" aria-label="View ${m.title} menu board full size">
          <img src="${img(m.file)}" alt="${m.title} drink menu board" loading="lazy" decoding="async" width="600" height="750" />
          <span class="shot-zoom" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21M11 8v6M8 11h6"/></svg>
          </span>
        </button>
        <figcaption>
          <p class="shot-occasion">${m.occasion}</p>
          <h3 class="shot-title">${m.title}</h3>
          <p class="shot-pours">${m.pours}</p>
        </figcaption>
      </figure>`
  ).join("");

  el.menuCount.textContent = `${GALLERY.length} menu boards`;

  el.gallery.querySelectorAll(".shot-btn").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(Number(btn.closest(".shot").dataset.i)));
  });
}

/* ---------------------------  LIGHTBOX  --------------------------- */

let lbIndex = 0;
let lastFocus = null;

function showSlide(i) {
  lbIndex = (i + GALLERY.length) % GALLERY.length;
  const m = GALLERY[lbIndex];
  el.lbImg.src = img(m.file);
  el.lbImg.alt = `${m.title} drink menu board`;
  el.lbTitle.textContent = m.title;
  el.lbPours.textContent = m.pours;
  el.lbPos.textContent = `${lbIndex + 1} / ${GALLERY.length}`;
}

function openLightbox(i) {
  lastFocus = document.activeElement;
  showSlide(i);
  el.lightbox.hidden = false;
  document.body.classList.add("lb-open");
  el.lbClose.focus();
}

function closeLightbox() {
  el.lightbox.hidden = true;
  document.body.classList.remove("lb-open");
  el.lbImg.removeAttribute("src");
  if (lastFocus) lastFocus.focus();
}

el.lbClose.addEventListener("click", closeLightbox);
el.lbPrev.addEventListener("click", () => showSlide(lbIndex - 1));
el.lbNext.addEventListener("click", () => showSlide(lbIndex + 1));
el.lightbox.addEventListener("click", (e) => {
  if (e.target === el.lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (el.lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showSlide(lbIndex - 1);
  if (e.key === "ArrowRight") showSlide(lbIndex + 1);
});

/* ---------------------------  INQUIRY  --------------------------- */

/**
 * Netlify Forms accepts a urlencoded POST to any static page on the site, so
 * we post to the form's own action and swap in a thank-you panel — no reload.
 */
el.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submit = el.form.querySelector("button[type=submit]");
  submit.disabled = true;
  el.formStatus.hidden = false;
  el.formStatus.className = "form-status";
  el.formStatus.textContent = "Sending…";

  try {
    const res = await fetch(el.form.getAttribute("action"), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(el.form)).toString(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    el.form.hidden = true;
    el.formDone.hidden = false;
    el.formDone.focus();
  } catch (err) {
    submit.disabled = false;
    el.formStatus.className = "form-status is-error";
    el.formStatus.textContent =
      "That didn't send — please try again, or reach us at @the_mobile_mixery_.";
    console.error(err);
  }
});

/* ---------------------------  CHIPS  --------------------------- */

function renderChips() {
  el.chipGroups.innerHTML = GROUPS.map(
    (g) => `
    <div class="chip-group">
      <span class="chip-label" id="lbl-${g.key}">${g.label}</span>
      <div class="chip-row" role="group" aria-labelledby="lbl-${g.key}">
        ${g.values
          .map(
            (v) => `
          <button type="button" class="chip" data-group="${g.key}" data-value="${v}" aria-pressed="false">
            ${g.key === "color" ? `<span class="dot" style="background:${SWATCHES[v]}"></span>` : ""}
            <span>${v}</span><span class="n"></span>
          </button>`
          )
          .join("")}
      </div>
    </div>`
  ).join("");

  el.chipGroups.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const { group, value } = chip.dataset;
      active[group].has(value) ? active[group].delete(value) : active[group].add(value);
      render();
    });
  });
}

/** Refresh pressed state + the live "how many would this give me" counts. */
function syncChips() {
  GROUPS.forEach((g) => {
    g.values.forEach((v) => {
      const chip = el.chipGroups.querySelector(`.chip[data-group="${g.key}"][data-value="${v}"]`);
      if (!chip) return;
      const n = chipCount(active, query, g.key, v);
      chip.setAttribute("aria-pressed", String(active[g.key].has(v)));
      chip.querySelector(".n").textContent = n;
      chip.style.opacity = n === 0 && !active[g.key].has(v) ? ".38" : "";
    });
  });
}

/* ---------------------------  CARDS  --------------------------- */

function cardHTML(d, i) {
  const tags = [...new Set([d.season, ...d.flavors])]
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);

  return `
    <article class="card" style="animation-delay:${Math.min(i, 11) * 35}ms">
      <div class="card-top">
        <h3 class="card-name">${d.name}</h3>
        <span class="card-swatch" style="background:${SWATCHES[d.color] || "#ccc"}" title="${d.color}"></span>
      </div>
      <div class="card-meta">
        <span class="card-base">${d.base}</span>
        <span class="card-season">${d.season}</span>
      </div>
      <p class="card-row"><b>Pour</b>${d.ingredients.join(" &middot; ")}</p>
      ${d.garnish ? `<p class="card-row"><b>Garnish</b>${d.garnish}</p>` : ""}
      <div class="card-tags">
        ${tags.map((t) => `<button type="button" data-tag="${t}">${t}</button>`).join("")}
      </div>
    </article>`;
}

/** A tag button toggles the matching chip when one exists, else searches it. */
function applyTag(tag) {
  const t = tag.toLowerCase();
  for (const g of GROUPS) {
    const v = g.values.find((x) => x.toLowerCase() === t || (x === "Minty" && t === "mint"));
    if (v) {
      active[g.key].has(v) ? active[g.key].delete(v) : active[g.key].add(v);
      render();
      return;
    }
  }
  query = t;
  el.q.value = tag;
  render();
}

/* ---------------------------  RENDER  --------------------------- */

function render() {
  const list = results(active, query);

  el.grid.innerHTML = list.map(cardHTML).join("");
  el.grid.querySelectorAll("[data-tag]").forEach((b) =>
    b.addEventListener("click", () => applyTag(b.dataset.tag))
  );

  const n = activeCount(active) + (query ? 1 : 0);
  el.count.innerHTML = `Showing <b>${list.length}</b> of ${DRINKS.length} drinks${
    n ? ` &middot; ${n} filter${n > 1 ? "s" : ""} on` : ""
  }`;

  el.empty.hidden = list.length > 0;
  el.grid.hidden = list.length === 0;
  el.clear.hidden = n === 0;

  syncChips();
}

function clearAll() {
  GROUPS.forEach((g) => active[g.key].clear());
  query = "";
  el.q.value = "";
  render();
}

/* ---------------------------  INIT  --------------------------- */

el.drinkCount.textContent = `${DRINKS.length} cocktails`;

renderGallery();
renderChips();
render();

el.q.addEventListener("input", (e) => {
  query = e.target.value.trim().toLowerCase();
  render();
});
el.clear.addEventListener("click", clearAll);
el.emptyClear.addEventListener("click", clearAll);
document.getElementById("filters").addEventListener("submit", (e) => e.preventDefault());

/* Scroll reveal */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
);
document.querySelectorAll(".section-head, .shot, .inquiry-intro").forEach((n) => {
  n.classList.add("reveal");
  io.observe(n);
});
