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
import { deleteVisitor, getVisitorsByPage, } from "../lib/visitors";
import toast from "react-hot-toast";
import { useAuth } from "../Context/authContext";
import { FormModal } from "../components/FormModal";
import Pagination from "../components/Pagination";
import FiltersDropdown from "../components/FilterDropdown";


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
    console.log("user from context", user);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorToDelete, setVisitorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [optimisticVisitors, updateOptimisticVisitors] = useOptimistic(
    visitors,
    (state, id) => state.filter((visitor) => visitor.id !== id)
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState([
  {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }
]);
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('');
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      dateFilterEnabled
    );
    setVisitors(visitors);
    setTotalPages(Math.ceil(total / limit));
    setTotalVisitors(total);
  } catch (err) {
    setError("Failed to load visitors. Try again.");
  } finally {
    setLoading(false);
  }
};

  const handleView = (visitor) => {
    setSelectedVisitor(visitor);
  };

  const confirmDelete = (visitor) => {
    setVisitorToDelete(visitor);
  };

  const handleDelete = async () => {
    if (!visitorToDelete) return;
    setIsDeleting(true);
    startTransition(() => updateOptimisticVisitors(visitorToDelete.id));

    try {
      await deleteVisitor(visitorToDelete.id);
      setVisitors((prev) => prev.filter((v) => v.id !== visitorToDelete.id));
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

  useEffect(() => {
    if (showCreateModal || selectedVisitor || visitorToDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showCreateModal, selectedVisitor,visitorToDelete]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl w-full mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
          <p className="text-gray-600">No visitors yet.</p>
        ) : (
          <div className="overflow-x-auto min-h-screen  bg-white rounded-md border border-gray-200 shadow">
            <div className="flex items-center justify-between px-4 py-3">
              {/* top  */}
              <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Visitors ({totalVisitors})
              </h1>

              <div className=" flex gap-2 justify-end">
                <div className="">
                  <input
                    type="text"
                    placeholder="Search by name, phone or district..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border px-4 py-2 rounded w-full sm:w-80"
                  />
                </div>

                {user.role === "admin" && (
                  <div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded cursor-pointer shadow transition-colors duration-200">
                      <FiPlus className="" /> Create Visitor
                    </button>
                  </div>
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
                <button className="inline-flex items-center gap-1 bg-White hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded cursor-pointer shadow transition-colors duration-200">
                  Download all
                </button>
              </div>
            </div>

            {/* table */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className=" text-gray-600 uppercase text-sm">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-medium uppercase tracking-wider">
                    Full Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-medium uppercase tracking-wider">
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left  font-medium uppercase tracking-wider">
                    Check-In
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left  font-medium uppercase tracking-wider">
                    Check-Out
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left  font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 justify-end text-left font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {optimisticVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap truncate">
                      {visitor.fullname}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {visitor.phone_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(
                        `1970-01-01T${visitor?.timeIn?.replace(/(\+.*)$/, "")}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }) || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(
                        `1970-01-01T${visitor?.timeOut?.replace(/(\+.*)$/, "")}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }) || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(visitor.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => handleView(visitor)}
                        className="text-blue-600 cursor-pointer hover:bg-blue-50 p-2 rounded-full"
                        title="View Details">
                        <FiEye />
                      </button>

                      {user.role === "admin" && (
                        <button
                          onClick={() => confirmDelete(visitor)}
                          className="text-red-600 cursor-pointer hover:bg-red-50 p-2 rounded-full"
                          title="Delete Visitor">
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        )}

        {/* View Modal */}
        {selectedVisitor && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
              <h2 className="text-xl font-bold mb-4">Visitor Details</h2>
              <div className="space-y-2 text-gray-800 text-sm">
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
                    hour12: false, // Set to false if you want 24-hour format
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
                      {selectedVisitor?.created_by?.username}{" "}
                      <span className="text-xs text-gray-500">
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
            <div className="bg-white border border-gray-400 rounded-xl p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-red-600">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 mb-6">
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative max-h-[94vh] overflow-y-auto">
              <button
                className="absolute top-3 right-3 bg-white hover:bg-gray-100 cursor-pointer border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500"
                onClick={() => setShowCreateModal(false)}
                title="Close">
                <FiX className="inline" />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Add New Visitor
              </h2>
              <FormModal/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVisitors;
