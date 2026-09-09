# The Mobile Mixery — Product Requirements

## Original Problem Statement
App for mobile bartenders: drink recipes and garnish ideas, ideas for drink combinations and menu ideas per event, a link to the company website (www.themobilemixeryca.com) for booking, plus valuable info for mobile bartenders and event coordinators.

## User Choices
- Recipes/menus: curated built-in library **and** AI-generated ideas
- Main goal: browse recipes **and** build & save event menus
- Booking site: https://www.themobilemixeryca.com
- Auth: optional login to save favorites & menus (browse freely without login)
- Design: bright & fresh, purple-forward
- Users can add their own photos to recipes

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT auth (bcrypt). AI via emergentintegrations (gpt-5.4). Images via Emergent Object Storage. All routes under `/api`.
- **Frontend**: Expo Router (React Native). Tabs: Discover, Mix Magic, Events, Profile. @tanstack/react-query for data. Theme in src/theme.ts (light, purple). Fonts: Playfair Display (display) + Plus Jakarta Sans (text). Icons: phosphor-react-native. Bottom sheets: @gorhom/bottom-sheet.

## User Personas
- Mobile bartender: needs recipes, garnish ideas, quick menu building per gig.
- Event coordinator: needs menu ideas and a way to book the company.

## Core Requirements (static)
- Curated recipe library with detail (ingredients, steps, garnish, photo)
- Garnish inspiration gallery
- AI menu generator from an event brief
- Event menu builder (create event, add/remove drinks, share)
- Favorites per user
- User-uploaded photos on recipes
- Booking website link + coordinator info

## Implemented (2026-06)
- [x] Backend: auth (register/login/me), recipes+garnishes+categories seed, favorites, events+items, AI generate-menu, image upload/download, company info
- [x] Discover tab: search, category chips, garnish carousel, recipe grid
- [x] Recipe detail: segmented ingredients/steps, favorite, add-to-event sheet, custom photo upload
- [x] Mix Magic: AI generator form + results + save-as-event
- [x] Events: login gate, create modal, list, detail with category chips + add-drinks sheet + remove/share/delete
- [x] Profile: account/login/logout, favorites preview, Book Us card, coordinator info
- [x] Auth modal (login/register)
- [x] In-app account deletion (DELETE /api/auth/me, cascades) + /health endpoint
- [x] Bar Tools (2026-06): Shopping List Calculator + Batch Guide (deterministic bar math in bar_math.py; endpoints /api/tools/shopping-list & /api/tools/batch). Entry points on Recipe detail (Batch), Event detail (Shopping cart, prefills menu+guests), and Profile "Bar Tools".
- [x] Tested end-to-end (40/40 backend pytest, frontend flows verified)

## Backlog / Remaining
- P1: RevenueCat subscriptions (paywall) — queued, awaiting user answers on tiers/limits
- P1: Save/share event menu as PDF
- P1: Push individual AI drinks into an existing event menu
- P2: Edit event details after creation
- P2: Syrup Lab (signature syrups yields/shelf-life) from Batch Bar Bible
- P2: Dark theme
