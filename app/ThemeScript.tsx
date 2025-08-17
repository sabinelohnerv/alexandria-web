export default function ThemeScript() {
    const code = `
  try {
    const ls = localStorage.getItem("theme");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = ls === "light" || ls === "dark" ? ls : (sysDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch {}
  `;
    return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
