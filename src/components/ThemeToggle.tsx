import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine what to show based on current theme and hover state
  const isDark = theme === 'dark';
  
  // On hover, we show the OPPOSITE icon to indicate what clicking will do
  const showSun = (isDark && isHovered) || (!isDark && !isHovered);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        {showSun ? (
          <Sun className="h-5 w-5 transition-all animate-in fade-in zoom-in duration-200" />
        ) : (
          <Moon className="h-5 w-5 transition-all animate-in fade-in zoom-in duration-200" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}