// Curated recipe, garnish and syrup seed data for The Mobile Mixery.
//
// Generated from backend/seed_data.py so the catalog is identical to the one the
// Python API served. Loaded into Postgres by ensureSeeded() in the api function;
// inserts are keyed on id and skipped when a row already exists.

export type SeedRecipe = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  image_url: string;
  glass: string;
  base_spirit: string;
  ingredients: string[];
  steps: string[];
  garnish: string;
  difficulty: string;
};

export type SeedGarnish = { id: string; title: string; image_url: string; tip: string };

export type SeedSyrup = {
  id: string;
  name: string;
  color: string;
  base_yield_oz: number;
  shelf_life: string;
  ingredients: string[];
  steps: string[];
  tip: string;
};

export const SEED_RECIPES: SeedRecipe[] = [
  {
    "id": "lavender-haze",
    "name": "Lavender Haze",
    "category": "Cocktails",
    "tags": [
      "Floral",
      "Refreshing",
      "Signature"
    ],
    "description": "Our signature gin sour with house lavender syrup and a whisper of citrus.",
    "image_url": "https://images.unsplash.com/photo-1589378938275-947b7adf8665?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUyfDA&ixlib=rb-4.1.0&q=85",
    "glass": "Coupe",
    "base_spirit": "Gin",
    "ingredients": [
      "2 oz gin",
      "0.75 oz lavender syrup",
      "0.75 oz fresh lemon juice",
      "1 egg white",
      "2 dashes lavender bitters"
    ],
    "steps": [
      "Dry shake all ingredients without ice to build foam.",
      "Add ice and shake hard for 12 seconds.",
      "Double strain into a chilled coupe.",
      "Finish with lavender bitters on the foam."
    ],
    "garnish": "Dried lavender sprig & lemon twist",
    "difficulty": "Medium"
  },
  {
    "id": "purple-rain-spritz",
    "name": "Purple Rain Spritz",
    "category": "Cocktails",
    "tags": [
      "Bubbly",
      "Sweet",
      "Crowd Pleaser"
    ],
    "description": "A photogenic sparkling spritz with butterfly pea and prosecco.",
    "image_url": "https://images.unsplash.com/photo-1582269438702-578efa319292?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUzfDA&ixlib=rb-4.1.0&q=85",
    "glass": "Wine Glass",
    "base_spirit": "Prosecco",
    "ingredients": [
      "1 oz butterfly pea gin",
      "0.5 oz elderflower liqueur",
      "3 oz prosecco",
      "1 oz soda",
      "Squeeze of lemon"
    ],
    "steps": [
      "Build gin and elderflower over ice.",
      "Top with prosecco and soda.",
      "Squeeze lemon and stir gently."
    ],
    "garnish": "Edible flower & lemon wheel",
    "difficulty": "Easy"
  },
  {
    "id": "garden-mojito",
    "name": "Garden Mojito",
    "category": "Cocktails",
    "tags": [
      "Minty",
      "Refreshing",
      "Classic"
    ],
    "description": "A muddled mint and lime rum classic, endlessly refreshing for summer events.",
    "image_url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "glass": "Highball",
    "base_spirit": "White Rum",
    "ingredients": [
      "2 oz white rum",
      "1 oz fresh lime juice",
      "0.75 oz simple syrup",
      "8 mint leaves",
      "Soda water"
    ],
    "steps": [
      "Muddle mint with syrup and lime.",
      "Add rum and ice, shake briefly.",
      "Strain over crushed ice, top with soda."
    ],
    "garnish": "Mint bouquet & lime wheel",
    "difficulty": "Easy"
  },
  {
    "id": "citrus-paloma",
    "name": "Citrus Paloma",
    "category": "Cocktails",
    "tags": [
      "Citrus",
      "Tart",
      "Tequila"
    ],
    "description": "Bright tequila and grapefruit with a salted rim - a mobile-bar favorite.",
    "image_url": "https://images.unsplash.com/photo-1623593688280-a5aec8ac4ae7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "glass": "Highball",
    "base_spirit": "Tequila",
    "ingredients": [
      "2 oz blanco tequila",
      "0.5 oz lime juice",
      "2 oz grapefruit soda",
      "Pinch of salt"
    ],
    "steps": [
      "Salt the rim of a highball.",
      "Build tequila, lime and salt over ice.",
      "Top with grapefruit soda."
    ],
    "garnish": "Grapefruit wedge & rosemary",
    "difficulty": "Easy"
  },
  {
    "id": "smoked-old-fashioned",
    "name": "Smoked Old Fashioned",
    "category": "Cocktails",
    "tags": [
      "Boozy",
      "Smoky",
      "Premium"
    ],
    "description": "A tableside smoked bourbon classic that wows guests at upscale events.",
    "image_url": "https://images.unsplash.com/photo-1621109328469-0e7c5f0c3fc7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBiYXJ0ZW5kZXIlMjBwb3VyaW5nJTIwZHJpbmslMjBldmVudHxlbnwwfHx8fDE3ODg5NDAyNTN8MA&ixlib=rb-4.1.0&q=85",
    "glass": "Rocks",
    "base_spirit": "Bourbon",
    "ingredients": [
      "2.5 oz bourbon",
      "0.25 oz demerara syrup",
      "2 dashes Angostura bitters",
      "Applewood smoke"
    ],
    "steps": [
      "Stir bourbon, syrup and bitters with ice.",
      "Strain over a large cube.",
      "Cap the glass and fill with applewood smoke."
    ],
    "garnish": "Orange peel & brandied cherry",
    "difficulty": "Medium"
  },
  {
    "id": "french-75",
    "name": "French 75",
    "category": "Cocktails",
    "tags": [
      "Bubbly",
      "Elegant",
      "Classic"
    ],
    "description": "Champagne, gin and lemon - effervescent elegance for weddings.",
    "image_url": "https://images.unsplash.com/photo-1582269438702-578efa319292?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUzfDA&ixlib=rb-4.1.0&q=85",
    "glass": "Flute",
    "base_spirit": "Gin",
    "ingredients": [
      "1 oz gin",
      "0.5 oz lemon juice",
      "0.5 oz simple syrup",
      "3 oz champagne"
    ],
    "steps": [
      "Shake gin, lemon and syrup with ice.",
      "Strain into a flute.",
      "Top with champagne."
    ],
    "garnish": "Long lemon twist",
    "difficulty": "Easy"
  },
  {
    "id": "berry-basil-smash",
    "name": "Berry Basil Smash",
    "category": "Mocktails",
    "tags": [
      "Fruity",
      "Zero Proof",
      "Fresh"
    ],
    "description": "A vibrant zero-proof smash of muddled berries, basil and lime.",
    "image_url": "https://images.unsplash.com/photo-1589378938275-947b7adf8665?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUyfDA&ixlib=rb-4.1.0&q=85",
    "glass": "Rocks",
    "base_spirit": "Zero-Proof",
    "ingredients": [
      "6 blackberries",
      "4 basil leaves",
      "0.75 oz lime juice",
      "0.5 oz simple syrup",
      "Soda water"
    ],
    "steps": [
      "Muddle berries, basil, lime and syrup.",
      "Fill with crushed ice.",
      "Top with soda and swizzle."
    ],
    "garnish": "Skewered berries & basil",
    "difficulty": "Easy"
  },
  {
    "id": "cucumber-cooler",
    "name": "Cucumber Cooler",
    "category": "Mocktails",
    "tags": [
      "Crisp",
      "Zero Proof",
      "Spa"
    ],
    "description": "Cool cucumber, mint and elderflower - a refreshing non-alcoholic sipper.",
    "image_url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "glass": "Highball",
    "base_spirit": "Zero-Proof",
    "ingredients": [
      "4 cucumber slices",
      "6 mint leaves",
      "0.5 oz elderflower cordial",
      "0.75 oz lime",
      "Tonic"
    ],
    "steps": [
      "Muddle cucumber and mint.",
      "Add cordial and lime over ice.",
      "Top with tonic."
    ],
    "garnish": "Cucumber ribbon & mint",
    "difficulty": "Easy"
  },
  {
    "id": "sparkling-pom",
    "name": "Sparkling Pomegranate",
    "category": "Mocktails",
    "tags": [
      "Sweet",
      "Zero Proof",
      "Festive"
    ],
    "description": "Festive pomegranate and citrus fizz that looks like a celebration.",
    "image_url": "https://images.unsplash.com/photo-1582269438702-578efa319292?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUzfDA&ixlib=rb-4.1.0&q=85",
    "glass": "Coupe",
    "base_spirit": "Zero-Proof",
    "ingredients": [
      "2 oz pomegranate juice",
      "0.5 oz lime",
      "0.5 oz honey syrup",
      "Sparkling water"
    ],
    "steps": [
      "Shake juice, lime and honey syrup.",
      "Strain into a coupe.",
      "Top with sparkling water."
    ],
    "garnish": "Pomegranate arils & mint",
    "difficulty": "Easy"
  },
  {
    "id": "rose-sangria",
    "name": "Rosé Sangria",
    "category": "Wine/Beer",
    "tags": [
      "Fruity",
      "Batch",
      "Summer"
    ],
    "description": "A batchable rosé sangria with stone fruit and berries - perfect for large crowds.",
    "image_url": "https://images.unsplash.com/photo-1589378938275-947b7adf8665?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUyfDA&ixlib=rb-4.1.0&q=85",
    "glass": "Wine Glass",
    "base_spirit": "Rosé Wine",
    "ingredients": [
      "1 bottle rosé",
      "2 oz peach liqueur",
      "Sliced peaches",
      "Mixed berries",
      "Soda to top"
    ],
    "steps": [
      "Combine rosé, liqueur and fruit.",
      "Chill for 2 hours.",
      "Serve over ice, top with soda."
    ],
    "garnish": "Fresh peach & berries",
    "difficulty": "Easy"
  },
  {
    "id": "hoppy-shandy",
    "name": "Citrus Hoppy Shandy",
    "category": "Wine/Beer",
    "tags": [
      "Beer",
      "Citrus",
      "Casual"
    ],
    "description": "A crisp session ale lightened with fresh lemonade - a casual event staple.",
    "image_url": "https://images.unsplash.com/photo-1623593688280-a5aec8ac4ae7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "glass": "Pint",
    "base_spirit": "Beer",
    "ingredients": [
      "6 oz session ale",
      "4 oz cloudy lemonade",
      "Squeeze of lemon"
    ],
    "steps": [
      "Fill a pint half with chilled ale.",
      "Top with lemonade.",
      "Finish with a lemon squeeze."
    ],
    "garnish": "Lemon wheel",
    "difficulty": "Easy"
  },
  {
    "id": "spiced-mule",
    "name": "Spiced Ginger Mule",
    "category": "Cocktails",
    "tags": [
      "Spicy",
      "Refreshing",
      "Classic"
    ],
    "description": "Vodka, fresh ginger beer and lime with a spicy kick, served in copper.",
    "image_url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "glass": "Copper Mug",
    "base_spirit": "Vodka",
    "ingredients": [
      "2 oz vodka",
      "0.5 oz lime juice",
      "4 oz ginger beer",
      "Candied ginger"
    ],
    "steps": [
      "Build vodka and lime over ice in a copper mug.",
      "Top with ginger beer.",
      "Stir and garnish."
    ],
    "garnish": "Lime wedge & candied ginger",
    "difficulty": "Easy"
  }
];

export const SEED_GARNISHES: SeedGarnish[] = [
  {
    "id": "g-citrus-twist",
    "title": "Expressed Citrus Twists",
    "image_url": "https://images.unsplash.com/photo-1623593688280-a5aec8ac4ae7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "tip": "Express the oils over the drink, then perch the twist on the rim for aroma and shine."
  },
  {
    "id": "g-herb-bouquet",
    "title": "Fresh Herb Bouquets",
    "image_url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "tip": "Slap mint or basil to release oils and plant a generous bouquet for a fragrant, lush look."
  },
  {
    "id": "g-edible-flowers",
    "title": "Edible Flowers",
    "image_url": "https://images.unsplash.com/photo-1582269438702-578efa319292?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUzfDA&ixlib=rb-4.1.0&q=85",
    "tip": "Float pansies or a single lavender sprig for an elegant, photo-ready finish."
  },
  {
    "id": "g-dehydrated",
    "title": "Dehydrated Fruit Wheels",
    "image_url": "https://images.unsplash.com/photo-1589378938275-947b7adf8665?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGNvY2t0YWlsJTIwcHVycGxlJTIwZHJpbmt8ZW58MHx8fHwxNzg4OTQwMjUyfDA&ixlib=rb-4.1.0&q=85",
    "tip": "Dehydrated citrus and berries add color, travel well, and never wilt on a mobile bar."
  },
  {
    "id": "g-skewers",
    "title": "Fruit & Berry Skewers",
    "image_url": "https://images.unsplash.com/photo-1623593688280-a5aec8ac4ae7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxjb2NrdGFpbCUyMGdhcm5pc2glMjBmcmVzaCUyMGxpbWUlMjBtaW50fGVufDB8fHx8MTc4ODk0MDI1M3ww&ixlib=rb-4.1.0&q=85",
    "tip": "Skewer berries or brandied cherries for a playful bite guests love."
  },
  {
    "id": "g-rims",
    "title": "Flavored Rims",
    "image_url": "https://images.unsplash.com/photo-1621109328469-0e7c5f0c3fc7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBiYXJ0ZW5kZXIlMjBwb3VyaW5nJTIwZHJpbmslMjBldmVudHxlbnwwfHx8fDE3ODg5NDAyNTN8MA&ixlib=rb-4.1.0&q=85",
    "tip": "Rim with citrus salt, smoked sugar or crushed freeze-dried fruit for extra sensory impact."
  }
];

export const SEED_SYRUPS: SeedSyrup[] = [
  {
    "id": "demerara",
    "name": "Demerara Syrup",
    "color": "#8B5E3C",
    "base_yield_oz": 16,
    "shelf_life": "1 month refrigerated",
    "ingredients": [
      "16 oz demerara sugar",
      "8 oz water"
    ],
    "steps": [
      "Heat water until warm (not boiling).",
      "Stir in demerara sugar until fully dissolved.",
      "Cool and bottle."
    ],
    "tip": "Rich 2:1 ratio — adds deep molasses notes to Old Fashioneds and tiki drinks."
  },
  {
    "id": "honey-ginger",
    "name": "Honey Ginger Syrup",
    "color": "#E0A526",
    "base_yield_oz": 12,
    "shelf_life": "2 weeks refrigerated",
    "ingredients": [
      "8 oz honey",
      "6 oz water",
      "2 oz fresh ginger"
    ],
    "steps": [
      "Grate or slice ginger.",
      "Simmer water and ginger 5 min.",
      "Off heat, stir in honey.",
      "Steep 20 min, strain, bottle."
    ],
    "tip": "Spicy-sweet backbone for mules, whiskey sours and hot toddies."
  },
  {
    "id": "vanilla-brown-sugar",
    "name": "Vanilla Brown Sugar Syrup",
    "color": "#A9743B",
    "base_yield_oz": 16,
    "shelf_life": "3 weeks refrigerated",
    "ingredients": [
      "12 oz brown sugar",
      "8 oz water",
      "1 vanilla bean"
    ],
    "steps": [
      "Split and scrape the vanilla bean.",
      "Warm water, dissolve brown sugar.",
      "Add bean + seeds, steep 30 min.",
      "Strain and bottle."
    ],
    "tip": "Cozy caramel-vanilla notes — perfect for espresso martinis and bourbon drinks."
  },
  {
    "id": "lavender",
    "name": "Lavender Syrup",
    "color": "#8B6FB0",
    "base_yield_oz": 12,
    "shelf_life": "2 weeks refrigerated",
    "ingredients": [
      "8 oz sugar",
      "8 oz water",
      "2 tbsp dried lavender"
    ],
    "steps": [
      "Bring water to a simmer.",
      "Add sugar and lavender, stir to dissolve.",
      "Steep 15 min (no longer — avoids soapiness).",
      "Strain and bottle."
    ],
    "tip": "Floral and elegant — our Lavender Haze signature. Don't over-steep."
  },
  {
    "id": "jalapeno-agave",
    "name": "Jalapeño Agave Syrup",
    "color": "#7BAE4B",
    "base_yield_oz": 12,
    "shelf_life": "3 weeks refrigerated",
    "ingredients": [
      "8 oz agave nectar",
      "4 oz water",
      "1 jalapeño"
    ],
    "steps": [
      "Slice jalapeño (seeds in for more heat).",
      "Warm water + agave together.",
      "Add jalapeño, steep 15-30 min to taste.",
      "Strain and bottle."
    ],
    "tip": "Sweet heat for spicy margaritas and palomas — taste as you steep."
  },
  {
    "id": "rosemary",
    "name": "Rosemary Syrup",
    "color": "#4E7A51",
    "base_yield_oz": 12,
    "shelf_life": "2 weeks refrigerated",
    "ingredients": [
      "8 oz sugar",
      "8 oz water",
      "4 sprigs rosemary"
    ],
    "steps": [
      "Simmer water and sugar until clear.",
      "Add rosemary sprigs off heat.",
      "Steep 20 min, strain, bottle."
    ],
    "tip": "Piney and aromatic — gorgeous with gin and grapefruit."
  },
  {
    "id": "cinnamon-toast",
    "name": "Cinnamon Toast Syrup",
    "color": "#B5651D",
    "base_yield_oz": 14,
    "shelf_life": "3 weeks refrigerated",
    "ingredients": [
      "10 oz sugar",
      "8 oz water",
      "3 cinnamon sticks"
    ],
    "steps": [
      "Toast cinnamon sticks in a dry pan 1 min.",
      "Add water + sugar, simmer to dissolve.",
      "Steep 30 min, strain, bottle."
    ],
    "tip": "Warm spice for fall menus, apple drinks and hot cocktails."
  },
  {
    "id": "hibiscus",
    "name": "Hibiscus Syrup",
    "color": "#B23A62",
    "base_yield_oz": 12,
    "shelf_life": "2 weeks refrigerated",
    "ingredients": [
      "8 oz sugar",
      "8 oz water",
      "0.5 oz dried hibiscus"
    ],
    "steps": [
      "Simmer water + sugar until clear.",
      "Add dried hibiscus off heat.",
      "Steep 15 min, strain, bottle."
    ],
    "tip": "Tart, ruby-red and Instagram-ready — great in spritzes and margaritas."
  },
  {
    "id": "passionfruit",
    "name": "Passionfruit Syrup",
    "color": "#E8952A",
    "base_yield_oz": 14,
    "shelf_life": "2 weeks refrigerated",
    "ingredients": [
      "8 oz sugar",
      "6 oz passionfruit puree",
      "2 oz water"
    ],
    "steps": [
      "Warm water + sugar to dissolve.",
      "Whisk in passionfruit puree off heat.",
      "Cool and bottle."
    ],
    "tip": "Tropical tang for tiki, margaritas and mocktails."
  },
  {
    "id": "quick-orgeat",
    "name": "Quick Orgeat",
    "color": "#EDE3D3",
    "base_yield_oz": 12,
    "shelf_life": "2 weeks refrigerated",
    "ingredients": [
      "8 oz almond milk",
      "8 oz sugar",
      "0.25 oz orange flower water",
      "0.25 oz vodka"
    ],
    "steps": [
      "Warm almond milk gently, dissolve sugar.",
      "Off heat, stir in orange flower water.",
      "Add vodka as preservative, bottle."
    ],
    "tip": "Nutty almond syrup for Mai Tais — vodka extends shelf life."
  }
];
