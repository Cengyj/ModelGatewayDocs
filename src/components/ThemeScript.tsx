/**
 * Inline script that runs before React hydrates so the initial paint
 * already matches the persisted theme. Prevents the light/dark flash.
 */
export function ThemeScript() {
  const code = `
(function () {
  try {
    var stored = localStorage.getItem('vitepress-theme-appearance');
    var appearance = (stored === 'light' || stored === 'dark' || stored === 'auto') ? stored : 'auto';
    var dark = appearance === 'dark' ||
      (appearance === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (_) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
