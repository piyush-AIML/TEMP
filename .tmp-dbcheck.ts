import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
import { createPrismaClient } from './src/lib/prisma-client';
const prisma = createPrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true }, orderBy: { email: 'asc' } });
  console.log('USERS:', JSON.stringify(users));
  for (const u of users) {
    if (u.role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: u.id },
        include: { course: { include: { professors: { include: { professor: { select: { email: true } } } } } } },
      });
      console.log(`ENROLLMENTS for ${u.email}:`, JSON.stringify(enrollments.map(e => ({ courseId: e.courseId, code: e.course.code, status: e.status, profs: e.course.professors.map(p => p.professor.email) }))));
    }
    if (u.role === 'PROFESSOR') {
      const links = await prisma.courseProfessors.findMany({ where: { professorId: u.id }, select: { course: { select: { code: true } } } });
      console.log(`PROFESSOR LINKS for ${u.email}:`, links.map(l => l.course.code).join(','));
    }
  }
  const counts = await Promise.all([
    prisma.course.count(),
    prisma.task.count(),
    prisma.meeting.count(),
    prisma.completionLog.count(),
    prisma.material.count(),
    prisma.classSession.count(),
  ]);
  console.log('COUNTS course/task/meeting/log/material/session:', counts.join('/'));
}
main().finally(() => prisma.$disconnect());
