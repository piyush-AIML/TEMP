import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { publicMetadataSchema } from '@/lib/validators/auth';

/**
 * Auth boundary (Dashboard Stage 0-C) — deliberately scoped to the dashboard
 * route group only. The marketing site and /api/enquiry never touch Clerk:
 * they must stay fully public and fast. Sign-in is public by design (the
 * <SignIn/> component handles itself); sign-up is invite-only via Clerk.
 *
 * File is proxy.ts (not middleware.ts) — Next 16 deprecated the middleware
 * filename in favour of proxy.
 */
const isDashboardRoute = createRouteMatcher(['/dashboard/(.*)']);
const isDashboardIndex = createRouteMatcher(['/dashboard']);

const ROLE_LANDING: Record<string, string> = {
  student: '/dashboard/student',
  professor: '/dashboard/professor',
  admin: '/',
};

export default clerkMiddleware(
  async (auth, req) => {
    if (isDashboardIndex(req)) {
      // /dashboard has no page of its own — dispatch by role here so the URL
      // stays clean. (A group-root page.tsx here collides with (site)/page.tsx
      // in Next 16 route resolution.)
      await auth.protect(); // signed out → /sign-in
      const { userId } = await auth();
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId as string);
      const parsed = publicMetadataSchema.safeParse(clerkUser.publicMetadata);
      const landing = parsed.success ? ROLE_LANDING[parsed.data.role] : '/';
      return NextResponse.redirect(new URL(landing, req.url));
    }
    if (isDashboardRoute(req)) {
      await auth.protect();
    }
  },
  { signInUrl: '/sign-in' }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
