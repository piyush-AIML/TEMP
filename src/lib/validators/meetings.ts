import { z } from 'zod';
import { datetimeLocalSchema, isAfterWallTime } from './datetime';

/**
 * One-on-one meeting input validation (Dashboard Stage 3). Mirror of
 * validators/sessions.ts with a different shape: a person the meeting is with
 * (STUDENT/PARENT/OTHER), an optional student link (required when STUDENT), a
 * title, IST datetime-local times, and an optional join link. Meetings have no
 * mode/location — only a link.
 */

export const meetingWithSchema = z.enum(['STUDENT', 'PARENT', 'OTHER'], {
  message: 'Choose who the meeting is with.',
});

export const meetingInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Give the meeting a title.')
      .max(120, 'Keep the title under 120 characters.'),
    withWhom: meetingWithSchema,
    // '' for PARENT/OTHER — the domain maps falsy → null.
    studentId: z.string().trim().optional().or(z.literal('')),
    startsAt: datetimeLocalSchema,
    endsAt: datetimeLocalSchema,
    link: z.string().trim().max(2048, 'That link is too long.').default(''),
  })
  .superRefine((value, ctx) => {
    if (!isAfterWallTime(value.endsAt, value.startsAt)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The meeting must end after it starts.',
        path: ['endsAt'],
      });
    }
    if (value.withWhom === 'STUDENT' && !value.studentId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose the student for this meeting.',
        path: ['studentId'],
      });
    }
    if (value.link) {
      try {
        const url = new URL(value.link);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('protocol');
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a full join link starting with http(s)://, or leave it blank.',
          path: ['link'],
        });
      }
    }
  });

export type MeetingInput = z.infer<typeof meetingInputSchema>;
