import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
import { createPrismaClient } from './src/lib/prisma-client';
import { EnrollmentStatus } from './src/generated/prisma/enums';
const prisma = createPrismaClient();
async function main() {
  const student = await prisma.user.findUnique({ where: { email: 'pika38212@gmail.com' } });
  if (!student) { console.log('NO STUDENT ROW'); return; }
  console.log('student id:', student.id, 'role:', student.role);
  const courseId = 'cmtn4uldx0000h6wehbpphdg0'; // LING-101
  // 1. Access check (exact page call)
  const row = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
  });
  console.log('access row:', row ? `${row.status}` : 'NULL');
  // 2. Upcoming sessions for course
  const sessions = await prisma.classSession.findMany({
    where: { courseId, status: 'SCHEDULED', startsAt: { gte: new Date() },
      course: { enrollments: { some: { studentId: student.id, status: EnrollmentStatus.ACTIVE } } } },
  });
  console.log('sessions:', sessions.length);
  // 3. Tasks (page call shape)
  const tasks = await prisma.task.findMany({ where: { courseId }, orderBy: [{ dueDate: 'asc' }, { id: 'asc' }] });
  console.log('tasks:', tasks.length, 'first due:', tasks[0]?.dueDate?.toISOString());
  // 4. Materials incl. storage resolution shape (fileMeta parse only)
  const materials = await prisma.material.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' } });
  console.log('materials:', materials.length, JSON.stringify(materials.map(m => ({ type: m.type, provider: m.fileProvider, key: !!m.fileKey }))));
  // Notifications the student would see
  const notifs = await prisma.notification.findMany({ where: { userId: student.id }, orderBy: { createdAt: 'desc' }, take: 10 });
  console.log('notifications:', notifs.map(n => `${n.type}:${n.title.slice(0, 40)}`).join(' | ') || 'none');
}
main().finally(() => prisma.$disconnect());
