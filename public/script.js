const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle.querySelector("span");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

document.querySelector("#year").textContent = new Date().getFullYear();

function currentTheme() {
  return root.dataset.theme || (systemTheme.matches ? "dark" : "light");
}

function updateThemeToggle() {
  const darkThemeActive = currentTheme() === "dark";
  const label = `Use ${darkThemeActive ? "light" : "dark"} theme`;

  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
  themeIcon.textContent = darkThemeActive ? "☀" : "☾";
}

themeToggle.addEventListener("click", () => {
  const theme = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = theme;

  try {
    localStorage.setItem("theme", theme);
  } catch {}

  updateThemeToggle();
});

systemTheme.addEventListener("change", () => {
  if (!root.dataset.theme) updateThemeToggle();
});

updateThemeToggle();
