# The Small Web — Browser & Publishing Engine

A full-stack implementation of **The Small Web**: an ecosystem of one-page HTML websites living in MongoDB, and a custom web browser to navigate, search, retrace, and publish them.

Built with **Next.js 14**, **NestJS**, **MongoDB** (with high-fidelity offline fallback), and **TypeScript**.

---

## 🚀 Quick Start Commands

### 1. Install Dependencies
```bash
pnpm install
# or
npm run install:all
```

### 2. Configure Environment (Optional)
If you have a MongoDB connection string, add it to `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smallweb?retryWrites=true&w=majority
```
*(Note: If no MongoDB URI is provided or MongoDB is offline on port 27017, the system automatically runs on an embedded local document store at `data/smallweb.json` without crashing).*

### 3. Seed Deterministic Data
Populates the database with 4 browsing personas, 10 interwoven sites, and 1 hour of browsing trails:
```bash
pnpm seed
# or
npm run seed
```

### 4. Run Both Services (Development)

Open two terminals or run simultaneously:

```bash
# Terminal 1: Backend API (Port 3001)
pnpm --prefix backend run start:dev

# Terminal 2: Frontend Browser (Port 3000)
pnpm --prefix frontend run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 The Four Core Pillars

### 1. Browse (`PageViewport.tsx` & `BrowserChrome.tsx`)
- **Address Bar**: Type any address (e.g. `tidepool.zz`, `atlas.void`) and press Enter to browse.
- **Link Interception**: Clicks on `<a href="...">` inside untrusted HTML are safely intercepted and dispatched to the browser's navigation engine.
- **Error 404 / Nowhere State**: Visiting addresses that do not exist (e.g. `sunken.reef`, `nowhere.void`) displays an authentic browser error page with a 1-click **"Publish here"** button.

### 2. Retrace (`useBrowserHistory.ts` & `HistoryDrawer.tsx`)
- **Linear Tab History Stack**: True browser navigation stack (`canGoBack`, `canGoForward`).
- **Forward-Stack Pruning**: Going back in history and following a new link prunes all subsequent forward entries, matching standard browser mechanics.
- **Restore on Return**: Scroll offsets are recorded on departure and automatically restored when stepping back and forward.
- **History Drawer**: Slide-over panel displaying the active persona's complete chronological visit history, arrival badges (`typed`, `link`, `retrace`, `search`, `jump`), and 1-click jump-to-visit navigation.

### 3. Search (`SearchModal.tsx` & `search.service.ts`)
- Full-text search across all sites' **HTML body content**, titles, and addresses.
- Displays match scores and highlighted surrounding text excerpts.
- Direct jump from search results into the matching site.

### 4. Publish (`PublishModal.tsx` & `sites.service.ts`)
- Anyone can publish a site: choose author identity, enter custom address, title, and raw HTML markup.
- Includes a **Live Preview** tab before submitting.
- Client and server-side domain format validation.
- Automatically saves to database and navigates the browser to the new address.

---

## 🛡️ Security & HTML Containment

> *"You are rendering markup you did not write into the same screen as your own interface. Anyone can publish, so assume someone will try to escape the page they published on."*

### How Containment is Guaranteed:
1. **Sandboxed `<iframe>` Isolation**:
   - The untrusted site HTML is rendered inside an `<iframe>` configured with `sandbox="allow-scripts"`.
   - **`allow-top-navigation` is strictly omitted**: Prevents any malicious page script from redirecting or hijacking the parent browser window (`window.top.location = ...` is blocked by the browser engine).
   - **`allow-same-origin` is omitted**: Guarantees the untrusted document runs in a unique origin, blocking access to `document.cookie`, `localStorage`, and `sessionStorage` of the host application.
   - **CSS Cascade Isolation**: CSS rules inside the site document (such as `body { display: none }` or global overrides) are physically confined to the iframe and cannot bleed into the browser chrome.

2. **Cross-Boundary Message Bridge**:
   - An injected script catches all anchor clicks inside the sandboxed frame, calls `event.preventDefault()`, and posts a structured message `{ type: 'NAVIGATE', address }` to the parent window.
   - The parent application validates the address before performing internal navigation.

---

## 👥 Personas & The Web Map

- **Alice Walker (`@alice`)**: Archivist & collector who has visited nearly every site across the small web.
- **Dr. Aris Thorne (`@aris`)**: Marine ecologist; author of `tidepool.zz`, `deepchronicle.org`, and `soil.network`.
- **Maya Lin (`@maya`)**: Cartographer & botanist; author of `atlas.void`, `lichen.notes`, and `greenhouse.lab`.
- **Julian Vance (`@julian`)**: Radio signal enthusiast; author of `signal.zone` and `concrete.poem`.

### Dead Links (Nowhere):
- `sunken.reef` (linked from `tidepool.zz`)
- `abyssal.plain` (linked from `deepchronicle.org`)
- `ghost.station` (linked from `signal.zone`)
- `nowhere.void` (linked from `soil.network`)
- `broken.page` (linked from `ephemera.log`)

---

## 📂 Project Structure

```text
WYXAN TASK/
├── backend/
│   ├── src/
│   │   ├── database/        # Mongoose connection + local document store fallback
│   │   ├── sites/           # Sites controller, service, schema, and DTOs
│   │   ├── users/           # Users controller, service, schema
│   │   ├── visits/          # Visits recording & history stream
│   │   ├── search/          # Full-text content search
│   │   ├── seed/            # Deterministic idempotent seed runner & 10 sites
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/      # BrowserChrome, PageViewport, HistoryDrawer, SearchModal, PublishModal
│   │   └── lib/             # API client, types, useBrowserHistory hook
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── package.json             # Root workspace runner
└── README.md
```
