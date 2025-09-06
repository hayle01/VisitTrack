import { useTheme } from "../Context/ThemeContext";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Determine if dark mode is active based on theme state and system preference
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleSelect = (value) => {
    setTheme(value);
    setOpen(false);
  };

  const iconFor = {
    light: <FiSun />,
    dark: <FiMoon />,
    system: <FiMonitor />,
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 text-lg rounded cursor-pointer
       
          ${isDark ? 'hover:bg-[#262626] text-gray-200' : 'hover:bg-gray-200  text-gray-900'}`}
      >
        {iconFor[theme]}
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-2 w-32 rounded shadow-lg z-10 border
            ${isDark ? 'bg-[#141414] border-[#262626] text-gray-200' : 'bg-white border-gray-200 text-gray-900'}`}
        >
          <div>
            {['light', 'dark', 'system'].map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`flex items-center w-full px-4 py-2 text-sm cursor-pointer
                  ${isDark ? 'hover:bg-[#262626]' : 'hover:bg-gray-100'}
                  ${theme === option ? "font-medium" : ""}`}
              >
                {iconFor[option]} <span className="ml-2 capitalize">{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
