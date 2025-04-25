
import React from 'react';
import { useTimer } from '@/contexts/TimerContext';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTimer();
  
  const themes = [
    { id: 'black-white', name: 'Black/White', preview: 'bg-black text-white' },
    { id: 'white-black', name: 'White/Black', preview: 'bg-white text-black border border-gray-300' },
    { id: 'neon-green', name: 'Neon Green', preview: 'bg-black text-[#39FF14]' },
    { id: 'neon-red', name: 'Neon Red', preview: 'bg-black text-[#FF3131]' },
    { id: 'neon-pink', name: 'Neon Pink', preview: 'bg-white text-[#FF69B4] border border-gray-300' },
  ] as const;

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3">Clock Theme</h3>
      
      <RadioGroup 
        value={theme} 
        onValueChange={(value) => setTheme(value as any)} 
        className="flex flex-wrap gap-2"
      >
        {themes.map((themeOption) => (
          <div key={themeOption.id} className="flex items-center space-x-2">
            <RadioGroupItem value={themeOption.id} id={themeOption.id} className="sr-only" />
            <Label 
              htmlFor={themeOption.id} 
              className={`${themeOption.preview} px-3 py-1.5 rounded cursor-pointer text-xs flex items-center justify-center ${theme === themeOption.id ? 'ring-2 ring-primary' : ''}`}
            >
              {themeOption.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ThemeSelector;
