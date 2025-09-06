import { useEffect, useState } from "react";
import { VscListFilter } from "react-icons/vsc";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useTheme } from "../../Context/ThemeContext";

// Define your 20 districts
const districts = [
  "Abdiaziz",
  "Bondhere",
  "Daynile",
  "Dharkenley",
  "Hamar Jajab",
  "Hamar Weyne",
  "Hodan",
  "Howl-Wadag",
  "Heliwaa",
  "Kaxda",
  "Karan",
  "Shangani",
  "Shibis",
  "Waberi",
  "Wadajir",
  "Warta Nabada",
  "Yaqshid",
  "Garasbaley",
  "Gubadley",
  "Darusalam",
];
export default function FiltersDropdown({
  gender,
  setGender,
  address,
  setAddress,
  dateRange,
  setDateRange,
  setDateFilterEnabled,
}) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const clearFilters = () => {
    setGender("");
    setAddress("");
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setDateFilterEnabled(false);
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    if (isDark) {
      document
        .querySelectorAll(
          ".rdrCalendarWrapper, .rdrMonthAndYearWrapper, .rdrDayNumber"
        )
        .forEach((el) => {
          el.style.backgroundColor = "#262626";
          el.style.color = "#fff";
        });
    }
  }, [isDark]);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        // onMouseLeave={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1 ${
          isDark
            ? "bg-[#0F0F0F] hover:bg-[#262626]  border-[#262626]"
            : "bg-white hover:bg-gray-100  border-gray-300"
        } px-4 py-2 border rounded cursor-pointer shadow transition-colors duration-200`}>
        <VscListFilter /> Filters
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 ${
            isDark
              ? "bg-[#0F0F0F] border-[#262626] text-gray-200"
              : "bg-white border-gray-200 text-gray-800"
          } border  rounded-lg shadow-lg z-10 p-4`}>
          {/* Gender */}
          <div className="mb-4">
            <label className="block text-sm font-medium  mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full ${
                isDark ? "bg-[#262626]" : "bg-white"
              } border rounded px-3 py-2`}>
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Address / District
            </label>
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full ${
                isDark ? "bg-[#262626]" : "bg-white"
              } border rounded px-3 py-2`}>
              <option value="">All</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className={`mb-4`}>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <DateRange
              editableDateInputs={true}
              onChange={(item) => {
                setDateRange([item.selection]);
                setDateFilterEnabled(true);
              }}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              rangeColors={["#2563eb"]}
            />
          </div>

          {/* Clear Filters */}
          <div className="mt-2 text-right">
            <button
              onClick={clearFilters}
              className="text-sm cursor-pointer text-blue-600">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
