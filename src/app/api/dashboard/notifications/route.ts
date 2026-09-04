import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getMyNotifications, getUnreadNotificationCount } from '@/lib/dashboard/notifications';

/**
 * Notification polling + mark-read endpoint (Dashboard Stage 2). The client
 * NotificationBell cannot import server-only query modules, so it talks to
 * this handler. Protected by the proxy matcher (/api/dashboard/:path* — the
 * 401 branch, never auth.protect which redirects); the handler re-checks
 * auth() as belt-and-suspenders.
 */
export const runtime = 'nodejs';

async function requireSessionUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const session = await getCurrentUser(); // cache()-deduped with the auth() above
  return session.userId;
}

/** Bell poll — unread count + the 20 latest rows. */
export async function GET() {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [unreadCount, notifications] = await Promise.all([
    getUnreadNotificationCount(userId),
    getMyNotifications(userId, 20),
  ]);
  return NextResponse.json({ unreadCount, notifications });
}

/** Mark one ({ id }) or all ({ all: true }) read — ownership in the WHERE. */
export async function POST(request: Request) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { id?: string; all?: boolean } | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (body.all === true) {
    await db().notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.id === 'string' && body.id.length > 0) {
    await db().notification.updateMany({
      where: { id: body.id, userId },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 });
}
