import React, {
  useEffect,
  useState,
  useTransition,
  useOptimistic,
} from "react";
import {
  FiEye,
  FiTrash2,
  FiLoader,
  FiAlertTriangle,
  FiPlus,
  FiX,
} from "react-icons/fi";
import {
  deleteVisitor,
  getCurrentUserRole,
  getVisitorsByPage,
} from "../lib/visitors";
import toast from "react-hot-toast";
import { useAuth } from "../Context/authContext";
import { FormModal } from "../components/FormModal";
import Pagination from "../components/Pagination";
import FiltersDropdown from "../components/FilterDropdown";
import { TbEdit } from "react-icons/tb";
import { useTheme } from "../Context/ThemeContext";
import { FaBan } from "react-icons/fa";
import { Loading } from "../components/Loading";
import { CiSearch } from "react-icons/ci";

// Utility to format date in readable way
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ManageVisitors = () => {
  const { profile: user } = useAuth();
  const { theme } = useTheme();

  const userRole = user?.role || null;

  // State for visitor data
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorToDelete, setVisitorToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visitorToUpdate, setVisitorToUpdate] = useState(null);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);

  // Optimistic update hook
  const [optimisticVisitors, deleteOptimisticVisitors] = useOptimistic(
    visitors,
    (state, id) => state.filter((visitor) => visitor.id !== id)
  );
  const [isPending, startTransition] = useTransition();

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const limit = 10;

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);

  // Debounce search input to avoid spamming backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch visitors whenever filters or page changes
  useEffect(() => {
    fetchVisitors();
  }, [page, debouncedSearch, gender, address, dateRange, dateFilterEnabled]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const { visitors, total } = await getVisitorsByPage(
        page,
        limit,
        debouncedSearch,
        gender,
        address,
        dateRange,
        dateFilterEnabled,
        userRole
      );
      setVisitors(visitors);
      setTotalPages(Math.ceil(total / limit));
      setTotalVisitors(total);
    } catch (err) {
      if (err.code === "ACCESS_DENIED") {
        setError("Access denied. You do not have permission to view this.");
      } else {
        setError("Failed to load visitors. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle view modal
  const handleView = (visitor) => setSelectedVisitor(visitor);

  // Open delete confirmation modal
  const confirmDelete = (visitor) => setVisitorToDelete(visitor);

  // Open update visitor modal
  const ShowUpdateModal = (visitor) => {
    setVisitorToUpdate(visitor);
    setShowCreateModal(true);
  };

  // Delete visitor with optimistic update
  const handleDelete = async () => {
    if (!visitorToDelete) return;
    setIsDeleting(true);

    // delete or update from UI optimistically
    deleteOptimisticVisitors(visitorToDelete.id);
    setTotalVisitors((count) => count - 1);

    startTransition(() => {
      setVisitors((prev) => prev.filter((v) => v.id !== visitorToDelete.id));
    });

    try {
      await deleteVisitor(visitorToDelete.id);
      toast.success("Visitor deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete visitor.");
      fetchVisitors();
    } finally {
      setVisitorToDelete(null);
      setIsDeleting(false);
    }
  };

  // Disable scrolling when any modal is open
  useEffect(() => {
    if (showCreateModal || selectedVisitor || visitorToDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showCreateModal, selectedVisitor, visitorToDelete]);

  // Determine if the current theme is dark
  // or if the system preference is dark
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const isAllowed = ["super_admin", "admin", "receptionist"].includes(userRole);

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
      <div
        className={`${
          isDark
            ? "bg-[#1A1A1A] border-[#262626] text-gray-100 shadow-black/30"
            : "bg-white border-gray-300 text-gray-900 shadow-gray-100"
        } rounded-md border`}>
        {/* actions and filters */}
        <div className="py-4 px-4 mb-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">Visitors ({totalVisitors})</h1>
            <div className="flex flex-wrap gap-2 items-center justify-end">
              {/* Search */}
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
              {isAllowed && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-1 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded shadow">
                  <FiPlus /> Create Visitor
                </button>
              )}
              <FiltersDropdown
                gender={gender}
                setGender={setGender}
                address={address}
                setAddress={setAddress}
                dateRange={dateRange}
                setDateRange={setDateRange}
                setDateFilterEnabled={setDateFilterEnabled}
              />
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

        {/* Main content: Visitors table */}
        {loading ? (
          <Loading />
        ) : error ===
          "Access denied. You do not have permission to view this." ? (
          <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
            <FaBan size={48} className="mb-4" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-sm">
              Please contact the admin for access permission.
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
            <FiAlertTriangle className="mx-auto mb-2" />
            <p>{error}</p>
            <button
              onClick={fetchVisitors}
              className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md">
              Try Again
            </button>
          </div>
        ) : optimisticVisitors.length === 0 ? (
          <div
            className={`text-center py-20 ${
              isDark ? "text-gray-100" : "text-gray-500"
            }`}>
            No visitors found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${
                isDark ? "divide-[#262626]" : "divide-gray-200"
              }`}>
              <thead
                className={`${
                  isDark ? "text-gray-100" : "text-gray-600"
                } uppercase text-sm`}>
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
                className={`divide-y ${
                  isDark ? "divide-[#262626]" : "divide-gray-200"
                }`}>
                {optimisticVisitors.map((visitor) => (
                  <tr
                    key={visitor?.id}
                    className={`${
                      isDark ? "hover:bg-[#0F0F0F]" : "hover:bg-gray-50"
                    }`}>
                    <td className="px-4 py-3 truncate">{visitor?.fullname}</td>
                    <td className="px-4 py-3">{visitor?.phone_number}</td>
                    <td className="px-4 py-3">
                      {visitor?.timeIn
                        ? new Date(
                            `1970-01-01T${visitor?.timeIn.replace(
                              /(\+.*)$/,
                              ""
                            )}`
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {visitor?.timeOut
                        ? new Date(
                            `1970-01-01T${visitor?.timeOut.replace(
                              /(\+.*)$/,
                              ""
                            )}`
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(visitor?.created_at)}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleView(visitor)}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer hover:bg-rose-50 p-2 rounded-full"
                        title="View">
                        <FiEye />
                      </button>

                      {(user.role === "admin" ||
                        user.role === "super_admin") && (
                        <button
                          onClick={() => ShowUpdateModal(visitor)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-blue-50 p-2 rounded-full"
                          title="Edit">
                          <TbEdit />
                        </button>
                      )}

                      {(user.role === "admin" ||
                        user.role === "super_admin") && (
                        <button
                          onClick={() => confirmDelete(visitor)}
                          className="text-red-600 hover:text-red-800 cursor-pointer hover:bg-red-50 p-2 rounded-full"
                          title="Delete">
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        )}

        {/* View Modal */}
        {selectedVisitor && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex justify-center items-center p-4">
            <div
              className={`${
                isDark ? "bg-[#1A1A1A] text-gray-200" : "bg-white text-gray-800"
              } rounded-xl p-6 max-w-md w-full shadow-lg`}>
              <h2 className="text-xl font-bold mb-4">Visitor Details</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Full Name:</strong> {selectedVisitor.fullname}
                </p>
                <p className="capitalize">
                  <strong>Gender:</strong> {selectedVisitor.gender}
                </p>
                <p>
                  <strong>Address:</strong> {selectedVisitor.address}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedVisitor.phone_number}
                </p>
                <p>
                  <strong>Check-In:</strong>{" "}
                  {new Date(
                    `1970-01-01T${selectedVisitor?.timeIn?.replace(
                      /(\+.*)$/,
                      ""
                    )}`
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }) || "N/A"}
                </p>
                <p>
                  <strong>Check-Out:</strong>{" "}
                  {new Date(
                    `1970-01-01T${selectedVisitor?.timeOut?.replace(
                      /(\+.*)$/,
                      ""
                    )}`
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }) || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedVisitor.created_at)}
                </p>
                <p>
                  <strong>Visiting:</strong> {selectedVisitor.visiting}
                </p>
                <p>
                  <strong>Reason for Visit:</strong> {selectedVisitor.reason}
                </p>
                <p>
                  <strong>Additional Notes:</strong> {selectedVisitor.notes}
                </p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {typeof selectedVisitor?.created_by === "string" ? (
                    "Visitor"
                  ) : (
                    <>
                      {selectedVisitor?.created_by?.username}
                      <span className="text-xs text-gray-500">
                        {" "}
                        ({selectedVisitor?.created_by?.role})
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="mt-6 text-right">
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="px-4 py-2 bg-gray-100 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {visitorToDelete && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex justify-center items-center p-4">
            <div
              className={`${
                isDark
                  ? "bg-[#1A1A1A] border-[#262626] text-gray-200"
                  : "bg-white border-gray-400 text-gray-700"
              } rounded-xl p-6 max-w-sm w-full shadow-lg`}>
              <h2 className="text-xl font-bold mb-4 text-red-600">
                Confirm Deletion
              </h2>
              <p className="mb-6">
                Are you sure you want to delete{" "}
                <strong>{visitorToDelete.fullName}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setVisitorToDelete(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                  {isDeleting ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <FormModal
            visitorToUpdate={visitorToUpdate}
            onClose={() => {
              setShowCreateModal(false);
              setVisitorToUpdate(null);
            }}
            onSuccess={(newOrUpdatedVisitor) => {
              startTransition(() => {
                const isUpdate = Boolean(visitorToUpdate);

                setVisitors((prev) => {
                  return isUpdate
                    ? prev.map((v) =>
                        v.id === newOrUpdatedVisitor.id
                          ? newOrUpdatedVisitor
                          : v
                      )
                    : [newOrUpdatedVisitor, ...prev];
                });

                if (!isUpdate) {
                  setTotalVisitors((count) => count + 1);
                }
              });

              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ManageVisitors;
