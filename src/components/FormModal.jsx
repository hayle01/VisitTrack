import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createVisitor, updateVisitor } from "../lib/visitors";
import { useTheme } from "../Context/ThemeContext";
import { FiX } from "react-icons/fi";

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

const toTimeWithTZ = (timeStr) => {
  if (!timeStr) return null;
  // If time is already in format "HH:mm:SS+00", return it
  if (/^\d{2}:\d{2}:\d{2}\+00$/.test(timeStr)) return timeStr;
  // If just HH:mm, convert to "HH:mm:00+00"
  if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00+00`;
  // Trim off any extra TZ and fix
  return timeStr.split("+")[0].replace(/:\d{2}$/, ":00") + "+00";
};
export const FormModal = ({ visitorToUpdate = null, onClose, onSuccess }) => {
  const isEditMode = Boolean(visitorToUpdate);

  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
       
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [visiting, setVisiting] = useState("");
  const [reason, setReason] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode && visitorToUpdate) {
      setFullName(visitorToUpdate.fullname || "");
      setPhone(visitorToUpdate.phone_number || "");
      setVisiting(visitorToUpdate.visiting || "");
      setReason(visitorToUpdate.reason || "");
      setGender(visitorToUpdate.gender || "");
      setAddress(visitorToUpdate.address || "");
      setTimeIn(visitorToUpdate.timeIn || "");
      setTimeOut(visitorToUpdate.timeOut || "");
      setNotes(visitorToUpdate.notes || "");
    } else {
      setTimeIn(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [isEditMode, visitorToUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !fullName ||
      !phone ||
      !visiting ||
      !reason ||
      !timeIn ||
      !gender ||
      !address
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const visitorPayload = {
      fullname: fullName,
      phone_number: phone,
      visiting,
      reason,
      gender,
      address,
      timeIn: toTimeWithTZ(timeIn),
      timeOut: timeOut ? toTimeWithTZ(timeOut) : null,
      notes: notes || null,
    };
    console.log("Visitor Payload:", visitorPayload);
    try {
      setIsLoading(true);
      if (isEditMode) {
        await updateVisitor(visitorToUpdate.id, visitorPayload);
        toast.success("Visitor updated successfully!");
        onSuccess?.({ id: visitorToUpdate.id, ...visitorPayload });
      } else {
        const newVisitor = await createVisitor(visitorPayload);
        toast.success("Visitor saved successfully!");
        onSuccess?.(newVisitor);
      }
     
      onClose?.();
    } catch (err) {
      toast.error("Failed to save visitor. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

const toTimeInputValue = (timeStr) => {
  if (!timeStr) return "";
  return timeStr.split(":").slice(0, 2).join(":"); // "14:45:00+00" → "14:45"
};
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div
        className={`${
          isDark ? "bg-[#1A1A1A] text-gray-200" : "bg-white text-gray-800"
        } rounded-xl p-6 max-w-md w-full shadow-lg relative max-h-[94vh] overflow-y-auto`}>
        <button
          className="absolute top-3 right-3 bg-white hover:bg-gray-100 cursor-pointer border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500"
          onClick={() => onClose()}
          title="Close">
          <FiX className="inline" />
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {isEditMode ? "Update Visitor" : "Add New Visitor"}
        </h2>
        {/* form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {error && (
            <div className="text-sm bg-red-300 rounded p-4 mb-4">{error}</div>
          )}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Full Name <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Gender <span className="text-red-400 text-xs">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address / District
            </label>
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400">
              <option value="">All</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Phone Number <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="Enter your active phone number"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Who are you visiting?{" "}
              <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="text"
              value={visiting}
              onChange={(e) => setVisiting(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="Enter the name of the person or department"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Reason for Visit <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="E.g., Meeting, Delivery, Interview, etc."
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Time In <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="time"
              value={toTimeInputValue(timeIn)}
              onChange={(e) => setTimeIn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Time Out (Optional)
            </label>
            <input
              type="time"
              value={toTimeInputValue(timeOut)}
              onChange={(e) => setTimeOut(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 mb-4"
              placeholder="Any other details you'd like to add"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-400 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-opacity-50 transition duration-200 cursor-pointer disabled:cursor-not-allowed disabled:bg-sky-400"
            disabled={isLoading}>
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update Visitor"
              : "Save & Check In"}
          </button>
        </form>
      </div>
    </div>
  );
};
