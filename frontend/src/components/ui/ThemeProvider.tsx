import React, { useEffect, useState } from 'react';
import { useThemeManager } from '../../hooks/useUIStore';
import { useCurrentTheme, useIsDarkMode, useCustomColors, useEffectSettings } from '../../store/uiSelectors';
import type { ThemeName } from '../../types/ui';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  enableSystemTheme?: boolean;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'auto',
  enableSystemTheme = true,
  storageKey = 'ui-theme'
}) => {
  const theme = useThemeManager();
  const currentTheme = useCurrentTheme();
  const isDarkMode = useIsDarkMode();
  const customColors = useCustomColors();
  const effects = useEffectSettings();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    if (!mounted) return;

    const storedTheme = localStorage.getItem(storageKey) as ThemeName;
    if (storedTheme && storedTheme !== currentTheme) {
      theme.setTheme(storedTheme);
    } else if (!storedTheme && defaultTheme !== currentTheme) {
      theme.setTheme(defaultTheme);
    }
  }, [mounted, theme, currentTheme, defaultTheme, storageKey]);

  // Persist theme changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(storageKey, currentTheme);
  }, [currentTheme, storageKey, mounted]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    body.classList.remove('dark', 'light');

    // Apply current theme
    root.classList.add(`theme-${currentTheme}`);
    body.classList.add(isDarkMode ? 'dark' : 'light');

    // Apply custom CSS variables
    const applyCustomProperties = () => {
      // Color variables
      Object.entries(customColors.background).forEach(([key, value]) => {
        root.style.setProperty(`--color-bg-${key}`, value);
      });
      
      Object.entries(customColors.text).forEach(([key, value]) => {
        root.style.setProperty(`--color-text-${key}`, value);
      });
      
      Object.entries(customColors.border).forEach(([key, value]) => {
        root.style.setProperty(`--color-border-${key}`, value);
      });
      
      Object.entries(customColors.surface).forEach(([key, value]) => {
        root.style.setProperty(`--color-surface-${key}`, value);
      });

      // Effect variables
      Object.entries(effects.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
      
      Object.entries(effects.blur).forEach(([key, value]) => {
        root.style.setProperty(`--blur-${key}`, value);
      });
      
      Object.entries(effects.transitions).forEach(([key, value]) => {
        root.style.setProperty(`--transition-${key}`, value);
      });
    };

    applyCustomProperties();

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? customColors.background.primary : '#ffffff');
    }
  }, [mounted, currentTheme, isDarkMode, customColors, effects]);

  // System theme detection
  useEffect(() => {
    if (!enableSystemTheme || !mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // This is handled by the store's system preference detection
      if (currentTheme === 'auto') {
        // Force re-render to update classes
        const root = document.documentElement;
        const body = document.body;
        
        body.classList.remove('dark', 'light');
        body.classList.add(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [enableSystemTheme, currentTheme, mounted]);

  if (!mounted) {
    // Prevent flash of wrong theme
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default ThemeProvider;