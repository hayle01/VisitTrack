import React from "react";

const VisitorsViewModal = ({ visitor, onClose, isDark, formatDate }) => {
  if (!visitor) return null;

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    return new Date(`1970-01-01T${timeStr.replace(/(\+.*)$/, "")}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex justify-center items-center p-4">
      <div
        className={`${
          isDark ? "bg-[#1A1A1A] text-gray-200" : "bg-white text-gray-800"
        } rounded-xl p-6 max-w-md w-full shadow-lg`}>
        <h2 className="text-xl font-bold mb-4">Visitor Details</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Full Name:</strong> {visitor.fullname}</p>
          <p className="capitalize"><strong>Gender:</strong> {visitor.gender}</p>
          <p><strong>Address:</strong> {visitor.address}</p>
          <p><strong>Phone:</strong> {visitor.phone_number}</p>
          <p><strong>Check-In:</strong> {formatTime(visitor.timeIn)}</p>
          <p><strong>Check-Out:</strong> {formatTime(visitor.timeOut)}</p>
          <p><strong>Date:</strong> {formatDate(visitor.created_at)}</p>
          <p><strong>Visiting:</strong> {visitor.visiting}</p>
          <p><strong>Reason for Visit:</strong> {visitor.reason}</p>
          <p><strong>Additional Notes:</strong> {visitor.notes}</p>
          <p>
            <strong>Created By:</strong>{" "}
            {typeof visitor?.created_by === "string" ? (
              "Visitor"
            ) : (
              <>
                {visitor?.created_by?.username}
                <span className="text-xs text-gray-500">
                  {" "}({visitor?.created_by?.role})
                </span>
              </>
            )}
          </p>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorsViewModal;