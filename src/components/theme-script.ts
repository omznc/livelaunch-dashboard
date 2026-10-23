export const THEME_KEY = "ll-theme";

// Runs in <head> before the first paint. It must match applyTheme in theme.tsx.
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){}`;
