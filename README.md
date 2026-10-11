# The Developer Room — Immersive 3D Developer Portfolio

An interactive 3D portfolio. Visitors explore a cyberpunk developer bedroom‑office at night and click real 3D objects to discover who you are, what you build and how to reach you.

Everything in the room is modelled procedurally with Three.js primitives, custom geometry, canvas textures and small shaders, so there are **no paid assets, no model downloads and no API keys**.

| Object in the room | Opens |
| --- | --- |
| Computer monitors | **About Me**: bio, interests, goals, resume |
| Project display wall | **My Projects**: filterable cards and a detail view |
| Bookshelf | **Technical Skills**: grouped skill cards |
| Desk notebook | **Experience & Journey**: timeline |
| Coffee mug | **Fun Facts** |
| Window (city skyline) | **Social Profiles** |
| Door | **Contact Me**: validated form |

---

## Tech stack

React 19 · TypeScript · Vite 6 · Three.js · React Three Fiber 9 · Drei 10 · Tailwind CSS 4 · Framer Motion 12 · Lucide React · React Router 7 · Zustand 5 · Vitest + Testing Library.

## Getting started

Requires **Node.js 20+** (developed with Node 24).

```bash
npm install          # install dependencies
npm run dev          # start the dev server  → http://localhost:5173
npm test             # run unit & component tests (Vitest)
npm run typecheck    # TypeScript type check
npm run build        # type check + production build into dist/
npm run preview      # serve the production build locally → http://localhost:4173
```

> **npm 11+/12 note:** if npm reports that esbuild's install script was blocked and Vite fails to start, run `npm install-scripts approve esbuild` (or `npm rebuild esbuild`).

---

## Features

**Experience**
- **Loading screen** with *real* progress milestones (engine chunk, renderer, scene graph, shader compilation and first frame). It never fakes progress. If start‑up is unusually slow, "Continue anyway" and "Use classic view" appear after 15 s.
- **Intro**: "Welcome to my digital workspace.", typed greeting, **Explore Room**, **View Projects** and **Skip Intro**. Completing the intro is remembered in `localStorage`, so returning visitors go straight into the room.
- **Camera**: orbit (drag), zoom (wheel or pinch), smooth focus transitions to each object, **Reset view** and **Return to Room**. Orbit angles, zoom distance and a bounding box keep the camera inside the room, so it can't clip through walls.
- **Interaction**: subtle hover glow, a tooltip and a pointer cursor; click to focus the camera and open the panel. Dragging the camera never counts as a click, and UI panels don't trigger 3D objects behind them.
- **Navigation without free movement**: object guide chips, a mini room map, top navigation, and keyboard shortcuts (`← →` rotate, `+ −` zoom, `R` reset, `Esc` close).
- **Panels**: side panel on desktop (the camera re‑frames the object beside it). On mobile it is a bottom sheet with drag‑to‑dismiss. Panels support previous/next section, Escape to close, a focus trap and focus restore.
- **Ambient sound** is synthesised with WebAudio (soft rain and a pad). It's **muted by default** and starts only when the visitor clicks the sound toggle.

**Content honesty**
- Fictional sample projects and timeline entries show a **"Sample"** badge.
- Unconfigured links (empty URLs) appear as "not configured" instead of broken buttons.
- **Download Resume** is disabled with a configuration hint until `resumePath` is set.
- In **demo mode**, the contact form validates input but **makes no network request** and states clearly that the message was *not* sent. It offers a pre‑filled `mailto:` link instead.

**Accessibility**
- A full **classic portfolio** at `/classic` (semantic HTML, no WebGL) is linked from the navigation and from a skip link.
- Keyboard‑operable UI, visible focus rings, ARIA dialogs, `aria-pressed` filters and live regions for status messages.
- `prefers-reduced-motion`: camera moves become instant, idle drift, particles, blinking and steam stop, and UI animations are reduced.
- High‑contrast text on dark glass surfaces. Tap targets are ≥ 40 px.

**Robustness and performance**
- WebGL support is detected up front. If WebGL is unavailable, or the renderer crashes or loses its context, the app falls back to the classic portfolio with a notice.
- The 3D scene is a **lazy‑loaded chunk**, so the UI shell paints immediately. Vendor code is split into separate chunks.
- Instanced meshes for city buildings, books, keyboard keys and traffic. Cached and shared materials and canvas textures. Everything is disposed when you leave the route.
- **Adaptive quality**: a High/Low setting (auto‑detected on low‑power or mobile devices, saved in localStorage). Shadows, the environment map and extra lights are only used on High, and resolution scaling adapts to frame rate via `PerformanceMonitor`.
- No heavy post‑processing. Glow comes from emissive materials and additive sprites.

---

## Personalising the content

All content lives in **[`src/data/portfolio.ts`](src/data/portfolio.ts)**. You never need to touch 3D code to change text, links or projects; the project wall in the room is drawn from this data too.

1. Replace every `[YOUR …]` placeholder: `name`, `initials`, `role`, `tagline`, `location`, `email`, `intro`, `biography`, `interests`, `currentGoals`.
2. **Social links**: set `url` for each entry in `socialLinks`. An empty `url` shows "not configured". Supported icons: `github`, `linkedin`, `website`, `x`, `email`, `stackoverflow`, `devto`, `other`.
3. **Resume**: copy your PDF to `public/resume.pdf` and set `resumePath: '/resume.pdf'`.
4. **Experience and education**: edit the `experience` and `education` arrays (`kind`: `work`, `education`, `certification` or `milestone`).
5. **Skills**: edit `skills`. You can add an optional qualitative `level` (`Familiar`, `Proficient`, `Advanced`, `Expert`). Percentages are intentionally not used.
6. **Fun facts and contact copy**: edit `funFacts` and `contact`.
7. When an entry is real, remove `isSample: true` so its "Sample" badge disappears.

### Adding a project

Append to the `projects` array:

```ts
{
  id: 'my-new-project',                 // unique, URL-safe
  name: 'My New Project',
  summary: 'One line shown on the card.',
  description: 'Longer description for the detail view.',
  category: 'backend',                  // 'backend' | 'frontend' | 'mobile' | 'experimental'
  tech: ['Java 21', 'Spring Boot', 'PostgreSQL'],
  highlights: ['What you are proud of', 'Another highlight'],
  image: '/projects/my-new-project.webp', // optional — put the file in public/projects/
  githubUrl: 'https://github.com/you/my-new-project', // optional — empty hides the button
  liveUrl: '',                          // optional — empty hides the button
  year: '2025',
  featured: true,
}
```

The first six projects appear on the 3D display wall; all projects appear in the panel and the classic view.

---

## Environment variables

Copy `.env.example` to `.env.local`. All variables are optional; without them the site is fully static.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | *(empty)* | Base URL of an optional backend, e.g. `https://api.example.com`. |
| `VITE_USE_REMOTE_PORTFOLIO` | `false` | If `true` (and a base URL is set), content is fetched from `GET /api/portfolio`. Falls back to local data on error. |
| `VITE_CONTACT_MODE` | `demo` | `demo` (nothing is sent) or `api` (`POST /api/contact`). `api` is only enabled when a base URL is set. |
| `VITE_BASE_PATH` | `/` | Public base path when deploying to a sub‑folder (e.g. `/my-portfolio/`). |

> ⚠️ Every `VITE_*` variable is embedded in the public JavaScript bundle. **Never put secrets, tokens or API keys in them.**

## Connecting a backend later (e.g. Spring Boot + PostgreSQL)

The service layer is in [`src/services/`](src/services):
- `apiClient.ts`: fetch wrapper with timeouts and typed errors.
- `portfolioApi.ts`: content endpoints with local fallback.
- `contactApi.ts`: contact submission.

Expected endpoints, which return the shapes in [`src/types/portfolio.ts`](src/types/portfolio.ts):

| Method | Path | Body / response |
| --- | --- | --- |
| `GET` | `/api/portfolio` | `PortfolioData` |
| `GET` | `/api/projects` | `Project[]` |
| `GET` | `/api/skills` | `SkillCategory[]` |
| `GET` | `/api/experience` | `TimelineEntry[]` |
| `POST` | `/api/contact` | `{ name, email, subject, message }` → any `2xx` means delivered |

Backend checklist:
- Enable CORS for your site's origin.
- Validate and rate‑limit `/api/contact` on the server.
- Keep SMTP and database credentials server‑side.
- Return JSON error bodies (`{ "message": "..." }`); the form shows them to the visitor.

Then set `VITE_API_BASE_URL` and `VITE_CONTACT_MODE=api`, and rebuild.

---

## Adding real 3D assets later

The room is procedural, but you can swap in GLTF models piece by piece:

1. Export the model as `.glb` (optionally Draco‑compressed with `gltf-transform`) and put it in `public/models/`.
2. Load it with Drei: `const { scene } = useGLTF(assetUrl('/models/chair.glb'))`, then render `<primitive object={scene} />`. Call `useGLTF.preload(...)` for anything visible on first paint.
3. To make it interactive, wrap it in the existing `InteractiveObject` component (see [`src/scene/InteractiveObject.tsx`](src/scene/InteractiveObject.tsx)) with the section id it should open. Hover glow, tooltip, cursor and click‑to‑focus come for free.
4. If the object moves, adjust its camera framing in [`src/scene/layout.ts`](src/scene/layout.ts) (`SECTION_VIEWS`, `HOTSPOTS`, `MAP_POINTS`).
5. Keep textures ≤ 2K and prefer KTX2/WebP to keep the bundle light.

## Project structure

```
src/
  app/          App shell, router, portfolio data provider
  pages/        RoomPage (3D route) and ClassicPortfolio (accessible fallback)
  scene/        Three.js / R3F scene: room, furniture, city, lighting, camera, interactions
  components/   UI: layout (navigation, HUD, hero, loading, panels) and reusable UI pieces
  features/     Section content (about, projects, skills, experience, fun facts, social, contact)
  data/         portfolio.ts (your content) and sections.ts (section metadata)
  services/     API client, portfolio and contact services, env config
  store/        Zustand app state
  hooks/ utils/ audio/ styles/ types/
  __tests__/    Vitest + Testing Library tests
```

---

## Deployment (static hosting)

`npm run build` outputs a static site to `dist/`. Because the app uses client‑side routes (`/classic`), the host must serve `index.html` for unknown paths.

- **Netlify**: build command `npm run build`, publish directory `dist`. SPA fallback is already provided by `public/_redirects`.
- **Vercel**: framework preset *Vite*. SPA fallback is already provided by `vercel.json`.
- **GitHub Pages** (project site at `https://<user>.github.io/<repo>/`):
  1. Build with the base path: `VITE_BASE_PATH=/<repo>/ npm run build`. In PowerShell: `$env:VITE_BASE_PATH='/<repo>/'; npm run build`.
  2. Copy `dist/index.html` to `dist/404.html` so deep links work.
  3. Publish `dist/`, e.g. with `actions/deploy-pages` or the `gh-pages` package.
- **Any static server / Nginx**: serve `dist/` with `try_files $uri /index.html;`.

---

## Testing

`npm test` runs:
- contact validation unit tests
- contact form tests, including a check that demo mode never reports delivery
- project filtering tests
- panel tests (Escape and close button)
- resume configuration tests

The 3D scene itself was verified manually in the browser (desktop and mobile viewports).

## Known limitations

- Lighting is tuned for the default dark theme. Very old or low‑end GPUs automatically use the Low quality preset, which drops shadows and extra lights.
- WASD free‑walk is intentionally not included. Orbit, guided focus views and keyboard shortcuts cover all content reliably without motion‑sickness or clipping issues.
- Contact delivery requires a backend (see above); the default build is demo‑only by design.
