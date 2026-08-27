/**
 * Skip link (plan §33 advanced) — first focusable element on every page.
 */
export default function SkipLink() {
  return (
    <a
      href='#main-content'
      className='sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[130] focus:px-5 focus:py-3 focus:rounded-xl focus:bg-ec-indigo focus:text-white focus:text-sm focus:font-semibold focus:shadow-[0_8px_30px_rgba(30,42,120,0.3)]'
    >
      Skip to main content
    </a>
  );
}
