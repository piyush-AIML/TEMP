import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MaskLine from './MaskLine';

/**
 * The mask reveal's markup contract. Effects do not run under
 * `renderToStaticMarkup` (ADR 0007), so what is pinned here is the structure the
 * animation needs: an `overflow-hidden` box with the line inside it. If the
 * wrapper ever loses `overflow-hidden`, the line translates in the open and the
 * reveal becomes a slide — with every test still green before this one exists.
 */
describe('MaskLine', () => {
  it('clips the line it reveals', () => {
    const markup = renderToStaticMarkup(createElement(MaskLine, null, 'Five paths.'));
    expect(markup).toContain('overflow-hidden');
    expect(markup).toContain('Five paths.');
  });

  it('renders the text as real DOM text, not an image or a clip path', () => {
    const markup = renderToStaticMarkup(createElement(MaskLine, null, 'One learning ecosystem.'));
    expect(markup).toContain('>One learning ecosystem.<');
  });
});
