# Nyi Nyi Linn — Portfolio

Personal portfolio of **Nyi Nyi Linn**, a Full Stack Web Application Developer (Java · Spring Boot · Angular) based in Yangon, Myanmar.

It's built with semantic HTML, modern CSS and vanilla JavaScript. There's no build step and there are no dependencies.

## Structure
```
index.html          Page content
styles.css          Design system, components, responsive layout
script.js           Theme toggle, nav, animations, project filters, contact form
Nyi_Nyi_Linn.pdf    CV (Download CV buttons)
assets/profile.png  Profile photo
assets/title.png    Favicon
```

## Features
- Dark / light theme (follows the OS setting and remembers your choice)
- Hero section with a typing role rotator, a Java code-editor visual and animated stats
- About (photo, bio, education), Skills, Experience timeline, Projects (with filters), How I work, Contact
- The contact form opens the visitor's email client with a pre-filled message to `nyinyilinn@ucssittway.edu.mm`
- Fully responsive and accessible, and respects `prefers-reduced-motion`

## Run locally
Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Update content
| What | Where |
|---|---|
| Bio, experience, projects, contact details | `index.html` |
| Typing roles | `roles` array in `script.js` |
| Brand colors | `--accent-1` / `--accent-2` in `styles.css` |
| CV | Replace `Nyi_Nyi_Linn.pdf` |
| Send the form directly (no email app) | Replace the `mailto:` logic in `script.js` with Formspree / EmailJS / your own API |

## Deploy
Works as-is on Vercel (e.g. `nyinyilinn.vercel.app`), Netlify, GitHub Pages or any static host.
