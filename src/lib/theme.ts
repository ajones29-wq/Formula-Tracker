export type ThemeColor = 'red' | 'blue' | 'orange' | 'green' | 'purple' | 'cyan' | 'yellow';
export type ThemeMode = 'dark' | 'light' | 'system';

export const THEME_COLORS: { id: ThemeColor; name: string; hex: string; bgClass: string }[] = [
  { id: 'red', name: 'Formula Red', hex: '#dc2626', bgClass: 'bg-red-600' },
  { id: 'blue', name: 'Racing Blue', hex: '#2563eb', bgClass: 'bg-blue-600' },
  { id: 'orange', name: 'McLaren Papaya', hex: '#ea580c', bgClass: 'bg-orange-600' },
  { id: 'green', name: 'Aston Green', hex: '#16a34a', bgClass: 'bg-emerald-600' },
  { id: 'purple', name: 'Royal Purple', hex: '#9333ea', bgClass: 'bg-purple-600' },
  { id: 'cyan', name: 'Petronas Cyan', hex: '#0891b2', bgClass: 'bg-cyan-600' },
  { id: 'yellow', name: 'Ferrari Yellow', hex: '#ca8a04', bgClass: 'bg-yellow-600' },
];

export function getStoredThemeColor(): ThemeColor {
  const saved = localStorage.getItem('app-user-theme-color');
  if (saved && THEME_COLORS.some(c => c.id === saved)) {
    return saved as ThemeColor;
  }
  return 'red';
}

export function setThemeColor(color: ThemeColor) {
  localStorage.setItem('app-user-theme-color', color);
  if (color === 'red') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', color);
  }
  window.dispatchEvent(new CustomEvent('app-theme-changed', { detail: { color } }));
}

export function getStoredThemeMode(): ThemeMode {
  const saved = localStorage.getItem('app-user-theme-mode') as ThemeMode;
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved;
  }
  return 'dark';
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem('app-user-theme-mode', mode);
  
  let effectiveMode: 'dark' | 'light' = 'dark';
  if (mode === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectiveMode = prefersDark ? 'dark' : 'light';
  } else {
    effectiveMode = mode;
  }

  if (effectiveMode === 'light') {
    document.documentElement.setAttribute('data-mode', 'light');
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.setAttribute('data-mode', 'dark');
    document.documentElement.classList.remove('light');
  }

  window.dispatchEvent(new CustomEvent('app-theme-changed', { detail: { mode } }));
}

export function initTheme() {
  const color = getStoredThemeColor();
  setThemeColor(color);

  const mode = getStoredThemeMode();
  setThemeMode(mode);

  // Listen for OS system theme changes if set to 'system'
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (getStoredThemeMode() === 'system') {
        setThemeMode('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
  }
}
