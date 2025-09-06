// Pagination.js
import React from "react";
import { useTheme } from "../Context/ThemeContext";

const Pagination = ({ page, totalPages, setPage }) => {
   const { theme } = useTheme();
  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (totalPages <= 1) return null;

   const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`flex items-center justify-between px-4 py-4 text-sm ${isDark ? 'text-gray200' : 'text-gray-700'} `}>
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className={`px-3 py-1 cursor-pointer rounded border ${isDark ? 'border-[#262626] hover:bg-[#0F0F0F]' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50`}
      >
        Prev
      </button>

      <span>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        onClick={handleNext}
        disabled={page === totalPages}
         className={`px-3 py-1 cursor-pointer rounded border ${isDark ? 'border-[#262626] hover:bg-[#0F0F0F]' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
