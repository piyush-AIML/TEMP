# Educraft

A visually rich, 3D landing page for **Educraft** — a global digital education platform unifying linguistics, inclusive education, psychological counseling, AI & digital technologies, and NEET/JEE preparation under one trust umbrella.

Built with Next.js (App Router), React Three Fiber for the 3D hero scenes, and Tailwind CSS v4 for styling.

## ✨ Features

- **3D hero experience** — animated orbit ring with glowing course nodes, floating wireframe geometry, and a particle starfield (React Three Fiber + drei)
- **Course overview** — all 5 education verticals with detail cards
- **Enquiry modal** — fully validated enquiry form (general & course-locked modes) with accessible dialog (focus trap, Esc to close)
- **Responsive** — mobile-first layout with hamburger navigation
- **SEO-ready** — metadata, Open Graph tags, and `robots.txt`

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| 3D | Three.js · @react-three/fiber · @react-three/drei |
| Styling | Tailwind CSS v4 · tw-animate-css · Sora/Manrope fonts |
| Language | TypeScript |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/route.ts          # API route (health stub)
│   ├── globals.css           # Tailwind v4 theme + design tokens
│   ├── layout.tsx            # Root layout, fonts, metadata
│   └── page.tsx              # Landing page composition
├── components/
│   └── educraft/
│       ├── enquiry/          # EnquiryForm, EnquiryModal
│       ├── landing/          # Hero, TrustStrip, Pillars, Courses, FinalCTA
│       ├── layout/           # Navbar, Footer
│       ├── three/            # HeroScene, CourseOrbit3D, FloatingParticles
│       └── ui/               # Button, SectionHeading, FloatingEnquiryButton
├── context/                  # EnquiryModalContext
├── data/                     # courses.ts (course content)
└── hooks/                    # useReveal (scroll animations)
```

## 🚀 Getting Started

**Prerequisites:** Node.js ≥ 20.9

```bash
# install dependencies
npm install

# start the dev server (http://localhost:3000)
npm run dev

# production build
npm run build
npm run start

# lint
npm run lint
```

## 🌍 Environment Variables

None required. The app is fully static at runtime — the enquiry form is a client-side demo and no data is persisted or sent to a backend.

## ▲ Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repo.
3. Vercel auto-detects Next.js — keep the default build settings (build: `next build`).
4. No environment variables needed.
5. Click **Deploy**.

Or via the CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Adding a working enquiry form later

The current form only simulates submission. To make it send real enquiries you can:
- add a server action / API route that emails you (e.g. Resend), or
- post to a form backend (Formspree), or
- add a hosted Postgres (Neon/Supabase) — note SQLite does not work on Vercel (ephemeral filesystem).
