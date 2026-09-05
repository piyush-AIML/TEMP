import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
import { createClerkClient } from '@clerk/backend';
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
async function main() {
  const emails = ['pika38212@gmail.com', 'piyush.ghosal.ai@gmail.com', 'killerme69blank@gmail.com'];
  for (const email of emails) {
    const users = await clerk.users.getUserList({ emailAddress: [email] });
    for (const u of users.data) {
      console.log(email, '=>', 'clerkId:', u.id, '| role:', JSON.stringify(u.publicMetadata), '| createdAt:', new Date(u.createdAt).toISOString());
    }
    if (users.data.length === 0) console.log(email, '=> NO CLERK USER');
  }
}
main().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
