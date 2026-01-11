const setTheme = (theme) => {
  localStorage.setItem("theme", theme);
  document.body.setAttribute("data-theme", theme);
  document.getElementById("theme").innerText = `try '${theme == "light" ? "dark" : "light"}'`;
};

export const handleTheme = (theme) => {
  const stored = localStorage.getItem("theme");
  if (!stored) setTheme("light");
  else {
    if (!theme) setTheme(stored);
    else if (stored != theme) setTheme(theme);
  }
};

handleTheme();
