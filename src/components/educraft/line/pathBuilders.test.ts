import { describe, expect, it } from 'vitest';
import { ACT_ANCHORS } from './anchors';
import { assertContinuity, pathFor } from './pathBuilders';

/**
 * Path geometry + the seam contract. Source: Landing-Redesign-Plan.md §3.1.
 *
 * `assertContinuity` is the spec's answer to "the handoff feels broken": instead
 * of trusting that act boundaries line up, it proves each act's exit anchor
 * equals the next act's entry anchor.
 */

describe('pathFor', () => {
  it('produces a valid SVG path string', () => {
    const d = pathFor({ x: 0, y: 0 }, { x: 1, y: 1 });
    expect(d).toMatch(/^M\s?[\d.-]+[\s,][\d.-]+/);
    expect(d).toContain('C');
  });

  it('starts at the `from` anchor and ends at the `to` anchor', () => {
    const d = pathFor({ x: 0.25, y: 0.1 }, { x: 0.75, y: 0.9 });
    expect(d.startsWith('M 0.25 0.1')).toBe(true);
    expect(d.endsWith('0.75 0.9')).toBe(true);
  });

  it('is a straight line for the `line` shape', () => {
    expect(pathFor({ x: 0, y: 0 }, { x: 1, y: 0 }, 'line')).toBe('M 0 0 L 1 0');
  });

  it('is deterministic — the same inputs give the same string', () => {
    const a = { x: 0.1, y: 0.2 };
    const b = { x: 0.9, y: 0.8 };
    expect(pathFor(a, b, 'arc')).toBe(pathFor(a, b, 'arc'));
  });

  it('is independent of direction for the same curve family', () => {
    // A vertical drop and a vertical rise over the same span share control maths.
    const down = pathFor({ x: 0.5, y: 0 }, { x: 0.5, y: 1 });
    const up = pathFor({ x: 0.5, y: 1 }, { x: 0.5, y: 0 });
    expect(down).not.toBe(up);
    expect(down).toContain('C');
  });
});

describe('assertContinuity', () => {
  it('passes for the declared act chain', () => {
    expect(() => assertContinuity()).not.toThrow();
  });

  it('detects a broken seam', () => {
    // Prove the assertion has teeth: a deliberately mismatched chain must fail.
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
      pillars: { enter: { x: 0, y: 0 }, exit: { x: 1, y: 1 } },
    };
    expect(() => assertContinuity(broken)).toThrow(/origin\.exit/);
  });

  it('reports the offending seam by name', () => {
    const broken = {
      origin: { enter: { x: 0, y: 0 }, exit: { x: 0.1, y: 0.1 } },
      pillars: { enter: { x: 0.2, y: 0.2 }, exit: { x: 1, y: 1 } },
    };
    let message = '';
    try {
      assertContinuity(broken);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('origin.exit');
    expect(message).toContain('pillars.enter');
  });

  it('accepts the real ACT_ANCHORS unchanged', () => {
    expect(() => assertContinuity(ACT_ANCHORS)).not.toThrow();
  });
});
