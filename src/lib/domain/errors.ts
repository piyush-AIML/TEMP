/**
 * Domain-layer errors (Dashboard Stage 2). Domain functions throw these;
 * the thin 'use server' action layer maps them to ActionResult.formError so
 * the UI never leaks an existence oracle ("Course not found" for both missing
 * and not-owned resources).
 */

export type DomainErrorCode =
  | 'COURSE_NOT_OWNED'
  | 'MATERIAL_NOT_FOUND'
  | 'SESSION_NOT_FOUND'
  | 'NOT_FOUND'
  | 'MEETING_NOT_FOUND'
  | 'STUDENT_NOT_IN_ROSTER'
  | 'TASK_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'USER_NOT_STUDENT'
  | 'USER_NOT_PROFESSOR'
  | 'ALREADY_ENROLLED'
  | 'COURSE_CODE_TAKEN';

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}
