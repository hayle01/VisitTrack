import React, {
  useEffect,
  useState,
  useTransition,
  useOptimistic,
} from "react";
import {
  FiAlertTriangle,
} from "react-icons/fi";
import {
  deleteVisitor,
  getVisitorsByPage,
} from "../lib/visitors";
import toast from "react-hot-toast";
import { useAuth } from "../Context/authContext";
import { FormModal } from "../components/FormModal";
import Pagination from "../components/Pagination";
import { useTheme } from "../Context/ThemeContext";
import { FaBan } from "react-icons/fa";
import { Loading } from "../components/Loading";
import VisitorsTable from "../components/Visitors/VisitorsTable";
import VisitorsViewModal from "../components/Visitors/VisitorsViewModal";
import DeleteVisitorModal from "../components/Visitors/DeleteVisitorModal";
import VisitorsHeader from "../components/Visitors/VisitorsHeader";

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
        <VisitorsHeader
          isDark={isDark}
          totalVisitors={totalVisitors}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isAllowed={isAllowed}
          setShowCreateModal={setShowCreateModal}
          gender={gender}
          setGender={setGender}
          address={address}
          setAddress={setAddress}
          dateRange={dateRange}
          setDateRange={setDateRange}
          setDateFilterEnabled={setDateFilterEnabled}
          user={user}
        />

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
            <VisitorsTable
              visitors={optimisticVisitors}
              onView={handleView}
              onEdit={ShowUpdateModal}
              onDelete={confirmDelete}
              isDark={isDark}
              userRole={user?.role}
            />
            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        )}

        {/* View Modal */}
        {selectedVisitor && (
          <VisitorsViewModal
            visitor={selectedVisitor}
            onClose={() => setSelectedVisitor(null)}
            isDark={isDark}
            formatDate={formatDate}
          />
        )}

        {/* Delete Confirmation Modal */}
        {visitorToDelete && (
          <DeleteVisitorModal
            visitor={visitorToDelete}
            onCancel={() => setVisitorToDelete(null)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
            isDark={isDark}
          />
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