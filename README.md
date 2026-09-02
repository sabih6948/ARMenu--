# ARMenu
An augmented-reality restaurant menu. Customers scan a QR code at their table, browse the menu on their own phone, and place a true-to-scale 3D model of any dish in front of them — before they order.

**Live demo:** `https://ar-menu-sigma-eosin.vercel.app` *(update with your actual deployed URL)*

---

## Features

- **WebAR dish preview** — true-to-scale 3D placement on a real surface, via WebXR (Android/Chrome), Scene Viewer, or Quick Look (iOS)
- **Category drawer** — slide-in navigation with scroll-spy active highlighting; category order is explicitly controlled, not left to database insertion order
- **Live search** — instant client-side filtering by dish name
- **Grid / List views** — toggle between a compact grid and a full-width list
- **Admin dashboard** — JWT + bcrypt-protected panel to add, view, and remove menu items, including direct `.glb` model uploads
- **Payment integration** — Safepay checkout (card, JazzCash, EasyPaisa) wired directly into the storefront
- **Dynamic QR code** — generated server-side from the request's own host, so the same build works correctly on localhost and in production without manual reconfiguration

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | No framework overhead for a project this size |
| Styling | Tailwind CSS v4 (CLI build) | Utility-first styling, only used classes shipped |
| 3D / AR | [`<model-viewer>`](https://modelviewer.dev/) | Renders glTF models, delegates AR to native WebXR/ARCore/ARKit |
| Backend | Node.js + Express (MVC, ES Modules) | Lightweight REST API, JS end-to-end |
| Database | MongoDB Atlas via Mongoose | Flexible schema, cloud-hosted (required for serverless) |
| File storage | Cloudinary | Vercel's filesystem is read-only at runtime |
| Auth | JWT + bcrypt | Stateless — no server-side session storage needed |
| Payments | Safepay (`@sfpy/node-sdk`) | Hosted checkout, multiple local payment methods |
| Hosting | Vercel (serverless) | Free, auto-deploys on every push |

---

## Project structure

```
Backend/
  api/
    index.js         # Vercel serverless entry point (exports app, no .listen())
  config/
    db.js             # Cached Mongoose connection (avoids exhausting Atlas connection limits)
    cloudinary.js
    multerConfig.js
  controllers/
    menuController.js
    authController.js
    qrController.js
  middleware/
    authMiddleware.js  # requireAuth — verifies JWT on protected routes
  models/
    FoodItem.js
    Admin.js
  routes/
    menuRoutes.js
    authRoutes.js
    qrRoutes.js
    payRoutes.js
  public/
    index.html         # Customer-facing AR menu
    admin.html          # Admin dashboard (login-gated)
    css/
      output.css         # Compiled Tailwind (generated, not hand-edited)
  src/
    input.css            # Tailwind source — @theme design tokens live here
  server.js              # Local dev entry point (uses app.listen())
  vercel.json             # Vercel deployment config
  package.json
  .env                     # Not committed — see Environment variables below
```

---

## Running locally

```bash
npm install
npm run build:css
node server.js
```

- Menu: `http://localhost:5505`
- Admin panel: `http://localhost:5505/admin.html`

Re-run `npm run build:css` any time you add or change a Tailwind class in the HTML — it isn't automatic without `npm run watch:css` running alongside `server.js`.

---

## Environment variables

Create a `.env` file in `Backend/`:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SAFEPAY_API_KEY=your_safepay_api_key
PUBLIC_BASE_URL=https://your-deployed-url.vercel.app   # optional — see QR code note below
PORT=5505
```

In production, these are set in the Vercel dashboard (**Settings → Environment Variables**), never committed to the repo.

**Note on `MONGO_URI`:** if `mongodb+srv://` DNS lookups are blocked on your network, use the standard `mongodb://host1,host2,host3/...?replicaSet=...` format instead (resolve the shard hostnames via an SRV lookup tool, then assemble manually).

**Note on `PUBLIC_BASE_URL`:** the QR code endpoint prefers this variable if set (useful for pinning the production URL explicitly); otherwise it falls back to detecting the request's own host, which works correctly for local testing.

---

## Authentication

- Admin password is hashed with **bcrypt** before storage — never stored in plaintext
- Login issues a **JWT**, valid for **2 hours**, signed with `JWT_SECRET`
- The token is stored in the browser's `localStorage` and sent as `Authorization: Bearer <token>` on every admin write request
- `requireAuth` middleware verifies the token before `createItem`/`deleteItem` routes run; reading the menu (`GET /api/menu`) is public

To create or reset the admin account:
```bash
node createAdmin.js
```
This clears any existing admin and creates one fresh account — the system supports a single admin by design of this script, not by schema limitation.

---

## 3D models

Models are `.glb` files. Raw photogrammetry/LiDAR scans are compressed with [glTF-Transform](https://gltf-transform.dev/) (Draco geometry compression) before upload — this cuts file sizes by roughly 90% (one model went from 16.82MB to 1.01MB), keeping AR load times fast on mobile and staying under Cloudinary's free-tier upload limit.

```bash
gltf-transform optimize input.glb output.glb --compress draco --texture-compress false
```

`--texture-compress false` avoids a Sharp/libvips crash on some Windows setups; Draco compression alone still yields most of the size reduction.

**AR display settings** (in `index.html`'s `<model-viewer>` tags):
- `ar-scale="fixed"` — locks real-world scale, prevents user pinch-resizing (which previously caused visible distortion)
- `min-camera-orbit` / `max-camera-orbit` — clamps vertical camera tilt so users can't rotate far enough to see the unmodeled underside of scanned dishes

---

## Deployment

Hosted on **Vercel**, connected to this GitHub repo. Pushing to `main` triggers an automatic redeploy.

Key architectural points for serverless compatibility:
- `api/index.js` exports the Express app rather than calling `.listen()` — Vercel wraps it as a per-request function
- `config/db.js` caches the Mongoose connection in a global variable, avoiding a fresh connection (and exhausted Atlas connection limit) on every invocation
- All admin file uploads go to Cloudinary, not local disk — Vercel's filesystem is read-only at runtime
- Frontend and backend are served from the same Express app/origin — no CORS configuration needed

---

## Known limitations

- iOS AR (Quick Look) requires a `.usdz` file via a separate `ios-src` attribute — not yet implemented, so AR currently works on Android only
- AR placement stability depends on the device's own ARCore/ARKit tracking quality and environmental lighting/surface texture — this is a hardware/OS-level constraint, not something the app can fully control
- Admin uploads are capped at ~4.5MB by Vercel's serverless request body limit (separate from Cloudinary's own 10MB cap) — always compress `.glb` files before uploading
