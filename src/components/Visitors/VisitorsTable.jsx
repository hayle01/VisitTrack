// VisitorsTable.jsx
import React from "react";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { TbEdit } from "react-icons/tb";

const VisitorsTable = ({
  visitors = [],
  onView,
  onEdit,
  onDelete,
  isDark = false,
  userRole,
}) => {
  const formatTime = (time) => {
    if (!time) return "N/A";
    return new Date(`1970-01-01T${time.replace(/(\+.*)$/, "")}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table
        className={`min-w-full divide-y ${isDark ? "divide-[#262626]" : "divide-gray-200"}`}
      >
        <thead
          className={`${isDark ? "text-gray-100" : "text-gray-600"} uppercase text-sm`}
        >
          <tr>
            <th className="px-4 py-3 text-left font-medium">Full Name</th>
            <th className="px-4 py-3 text-left font-medium">Phone</th>
            <th className="px-4 py-3 text-left font-medium">Check-In</th>
            <th className="px-4 py-3 text-left font-medium">Check-Out</th>
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${isDark ? "divide-[#262626]" : "divide-gray-200"}`}
        >
          {visitors.map((visitor) => (
            <tr
              key={visitor?.id}
              className={`${isDark ? "hover:bg-[#0F0F0F]" : "hover:bg-gray-50"}`}
            >
              <td className="px-4 py-3 truncate">{visitor?.fullname}</td>
              <td className="px-4 py-3">{visitor?.phone_number}</td>
              <td className="px-4 py-3">{formatTime(visitor?.timeIn)}</td>
              <td className="px-4 py-3">{formatTime(visitor?.timeOut)}</td>
              <td className="px-4 py-3">{formatDate(visitor?.created_at)}</td>
              <td className="px-4 py-3 flex gap-2">
                <button
                  onClick={() => onView(visitor)}
                  className="text-rose-600 hover:text-rose-800 cursor-pointer hover:bg-rose-50 p-2 rounded-full"
                  title="View"
                >
                  <FiEye />
                </button>

                {(userRole === "admin" || userRole === "super_admin") && (
                  <>
                    <button
                      onClick={() => onEdit(visitor)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-blue-50 p-2 rounded-full"
                      title="Edit"
                    >
                      <TbEdit />
                    </button>
                    <button
                      onClick={() => onDelete(visitor)}
                      className="text-red-600 hover:text-red-800 cursor-pointer hover:bg-red-50 p-2 rounded-full"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitorsTable;
