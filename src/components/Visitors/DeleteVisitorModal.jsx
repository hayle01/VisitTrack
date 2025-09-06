import { FiTrash2, FiLoader } from "react-icons/fi";

const DeleteVisitorModal = ({
  visitor,
  onCancel,
  onConfirm,
  isDeleting,
  isDark,
}) => {
  if (!visitor) return null;

  return (
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
          <strong>{visitor.fullName || visitor.fullname}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={onConfirm}
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
  );
};

export default DeleteVisitorModal;
