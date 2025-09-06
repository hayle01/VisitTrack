import { useTheme } from '../Context/ThemeContext';
import { IoTrendingDown, IoTrendingUp } from 'react-icons/io5';

export const SummaryCard = ({
  title,
  value,
  icon: Icon,
  percentage,
  isPositive,
  comparisonText,
  bgColor,
  iconColor,
}) => {
  const { theme } = useTheme();
  // Determine if the current theme is dark
  // or if the system preference is dark
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div
      className={`rounded-lg p-4 flex items-center justify-between shadow-sm border ${
        isDark
          ? 'bg-[#1A1A1A] border-[#262626] shadow-black/30'
          : 'bg-white border-gray-300 shadow-gray-100'
      }`}
    >
      <div>
        <h4 className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {title}
        </h4>
        <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
          {value}
        </p>
        {percentage !== undefined && (
          <div
            className={`flex items-center text-sm ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isPositive ? (
              <IoTrendingUp className="mr-1" />
            ) : (
              <IoTrendingDown className="mr-1" />
            )}
            {percentage}%
            {comparisonText && (
              <span className={`ml-1 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                {comparisonText}
              </span>
            )}
          </div>
        )}
      </div>
      <div
        className={`text-3xl p-2 border rounded-full ${
          isDark ? 'border-[#262626]' : 'border-gray-300'
        } ${bgColor || 'bg-gray-400'}`}
      >
        <Icon className={`${iconColor}`} />
      </div>
    </div>
  );
};
