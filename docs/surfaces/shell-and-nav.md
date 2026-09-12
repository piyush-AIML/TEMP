The site shell: the navbar, the footer, and the theme-aware brand lockup that sits in both.

## Navbar

Transparent → blurred + bordered on scroll (`h-20`→`h-16`).

**Programmes mega menu:** 5 pillar rows + a mini ecosystem SVG map + audience links. Opens on hover *and* click; closes on Escape / outside-click / route-change, with focus return. Carries `aria-expanded` / `aria-controls`, route-aware active states via `aria-current`, and an accessible mobile menu.

**Dashboard sign-in entry** — added post-Stage-1 at the user's request. A "Sign in" text link sits in three places: the desktop nav (next to the Enquire CTA), the mobile menu (above Enquire), and the footer bottom bar. All three point at `/dashboard`, which dispatches signed-in users to their role root and sends signed-out visitors to the Clerk `/sign-in` page via `proxy.ts`.

**Deliberately no sign-up link anywhere** — sign-ups are invite-only.

**Invite flow (app-driven):** invitations are sent from the dashboard — an `admin` invites professors and students, a `professor` invites only students (policy in `INVITE_ROLES_BY_INVITER`, `src/lib/validators/auth.ts`) — via the Clerk Invitations API with `publicMetadata: { role }`. On acceptance Clerk copies the role into the new user's publicMetadata, so `getCurrentUser()` accepts them on first hit (no webhook needed). The earlier path (manual account creation in the Clerk dashboard + hand-set `publicMetadata.role`) still applies to the owner's own account — **to use the admin area, set your own Clerk user's `publicMetadata.role` to `"admin"`** (Clerk dashboard → Users → edit → public metadata); a self-service sign-up would create role-less users that `getCurrentUser()` rejects.

## Footer V2

Closing statement "Build learning journeys that last.", CTA pair, 4 nav clusters, constellation + path-lines background.

**No social icons** — deliberately absent until real handles exist (no dead `href="#"` links).

## Brand lockup

Theme-aware, using a CSS class switch (`dark:hidden` / `hidden dark:block`) — **no JS / hydration gating needed**.

| Theme | Asset | Intrinsic size |
|---|---|---|
| Light | `public/logo.png` | 2135×736 |
| Dark | `public/logo-dark.png` | 2172×724 |

Display sizes: Navbar `h-11 md:h-14`, Footer `h-14 md:h-16`.

This replaced an earlier GraduationCap + wordmark lockup and the `public/logo.svg` favicon. **No residual references to the old lockup remain** — `layout.tsx`'s icon is `/logo.png` and a source grep is clean.

## Contact details — not yet stakeholder-confirmed

`hello@educraft.com` / `+91 80 4567 8900` / Bangalore, India appear in the footer, the contact page, and structured data. These are a **`VERIFY`** item — a stakeholder input, not a code matter. See `docs/platform/blockers.md`.
