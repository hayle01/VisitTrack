import React from "react";
import { FiPlus } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import FiltersDropdown from "./FilterDropdown";

const VisitorsHeader = ({
  isDark,
  totalVisitors,
  searchTerm,
  setSearchTerm,
  isAllowed,
  setShowCreateModal,
  gender,
  setGender,
  address,
  setAddress,
  dateRange,
  setDateRange,
  setDateFilterEnabled,
  user,
}) => {
  return (
    <div className="py-4 px-4 mb-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Visitors ({totalVisitors})</h1>
        <div className="flex flex-wrap gap-2 items-center justify-end">
          {/* Search Input */}
          <div
            className={`flex items-center border px-2 rounded shadow md:w-76 w-full ${
              isDark
                ? "bg-[#141414] border-[#262626] text-gray-300"
                : "bg-gray-50 text-gray-900 border-gray-300"
            }`}>
            <CiSearch
              size={23}
              className={`${isDark ? "text-gray-200" : "text-[#64748B]"}`}
            />
            <input
              type="text"
              placeholder="Search by name, phone or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 w-full outline-none bg-transparent"
            />
          </div>

          {/* Create Visitor */}
          {isAllowed && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded shadow">
              <FiPlus /> Create Visitor
            </button>
          )}

          {/* Filters */}
          <FiltersDropdown
            gender={gender}
            setGender={setGender}
            address={address}
            setAddress={setAddress}
            dateRange={dateRange}
            setDateRange={setDateRange}
            setDateFilterEnabled={setDateFilterEnabled}
          />

          {/* Download All */}
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <button
              className={`inline-flex items-center cursor-pointer gap-1 ${
                isDark
                  ? "bg-[#0F0F0F] hover:bg-[#262626] border-[#262626]"
                  : " bg-white hover:bg-gray-100 border-gray-300"
              } border px-4 py-2 rounded shadow`}>
              Download all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorsHeader;
