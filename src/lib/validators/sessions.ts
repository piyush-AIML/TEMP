import { z } from 'zod';
import { datetimeLocalSchema, isAfterWallTime } from './datetime';

/**
 * Class-session input validation (Dashboard Stage 2). zod v4 API (§18 rule 3).
 * Forms submit datetime-local wall times (IST); mode decides which of
 * link/location is meaningful.
 */

export const sessionModeSchema = z.enum(['ONLINE', 'IN_PERSON'], {
  message: 'Choose whether the class is online or in person.',
});

export const sessionInputSchema = z
  .object({
    courseId: z.string().min(1, { message: 'Choose a course.' }),
    startsAt: datetimeLocalSchema,
    endsAt: datetimeLocalSchema,
    mode: sessionModeSchema,
    link: z.string().trim().max(2048, 'That join link is too long.').default(''),
    location: z.string().trim().max(200, 'Keep the location under 200 characters.').default(''),
  })
  .superRefine((value, ctx) => {
    if (!isAfterWallTime(value.endsAt, value.startsAt)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The class must end after it starts.',
        path: ['endsAt'],
      });
    }
    if (value.mode === 'ONLINE' && value.link) {
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

export type SessionInput = z.infer<typeof sessionInputSchema>;
