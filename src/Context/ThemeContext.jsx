import { createContext, useContext, useEffect, useState } from 'react';


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  });

  

  useEffect(() => {
    const applyTheme = (theme) => {
      const html = document.documentElement;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (theme === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
      } else if (theme === 'light') {
        html.classList.add('light');
        html.classList.remove('dark');
      } else {
        // System Mode
        html.classList.toggle('dark', systemPrefersDark);
        html.classList.toggle('light', !systemPrefersDark);
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    let mediaQuery;

    if (theme === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => applyTheme('system');
      mediaQuery.addEventListener('change', handler);

      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
