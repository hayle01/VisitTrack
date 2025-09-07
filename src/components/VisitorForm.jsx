import React, { useEffect, useState } from "react";
import logo from "../assets/logo.jpg";
import { MdOutlineAnnouncement } from "react-icons/md";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { createVisitor } from "../lib/visitors";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";

const districts = [
  "Abdiaziz", "Bondhere", "Daynile", "Dharkenley", "Hamar Jajab", "Hamar Weyne",
  "Hodan", "Howl-Wadag", "Heliwaa", "Kaxda", "Karan", "Shangani", "Shibis",
  "Waberi", "Wadajir", "Warta Nabada", "Yaqshid", "Garasbaley", "Gubadley", "Darusalam"
];
export const VisitorForm = () => {
  // States for form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [visiting, setVisiting] = useState("");
  const [reason, setReason] = useState("");
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('');
  const [timeIn, setTimeIn] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [timeOut, setTimeOut] = useState("");
  const [notes, setNotes] = useState("");

  // State for loading, success, and errors
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error state
    setError("");
    console.log("Heyy I am here");
    // Validation: Check required fields
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !visiting.trim() ||
      !reason.trim() ||
      !timeIn ||
      !gender.trim() ||
      !address.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const newVisitor = {
      fullname: fullName,
      phone_number: phone,
      visiting: visiting,
      reason: reason,
      timeIn: timeIn,
      gender,
      address,
      timeOut: timeOut || null,
      notes: notes || null,
    };

    try {
      setIsLoading(true);
      await createVisitor(newVisitor);
      toast.success("Visitor saved successfully!");
      setFullName("");
      setPhone("");
      setReason("");
      setVisiting("");
      setTimeIn("");
      setTimeOut("");
      setNotes("");
      setAddress('');
      setGender('');
      setSuccess(true);
    } catch (error) {
      // setError("Failed to create visitor. Please try again.");
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  if (success) {
    const timer = setTimeout(() => {
      setSuccess(false)
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [success, navigate]);

  // Success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow border border-gray-300 p-8">
            <div className="flex items-center justify-center">
              <IoCheckmarkDoneCircleOutline className="text-green-500 text-6xl mb-4 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome On Board!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for checking in. We’re honored to have you! Your visit
              means a lot — we hope it's productive and enjoyable.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Want to register another visitor?{" "}
              <button onClick={() => setSuccess(false)} className="text-blue-600 cursor-pointer underline">
                Click here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex items-center justify-center bg-gray-50 px-4 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg w-full sm:p-8 p-6 rounded-md bg-white flex flex-col space-y-4 shadow">
        <div className="flex items-center flex-col space-y-2 mb-4">
          <img src={logo} className="w-30 h-30" alt="Logo" />
          <h2 className="text-xl md:text-2xl text-center font-medium text-gray-900">
            Welcome, to <br />
            Wasaaradda Isgaarsiinta & Teknolojiyada Visitor Registration
          </h2>
          <p className="text-gray-700">
            Please fill out the form below to check in:
          </p>
        </div>

        {/* Error message */}
        {error && <div className="text-sm bg-red-300 rounded p-4">{error}</div>}

        {/* Full Name */}
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
        {/* Gender */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Gender <span className="text-red-400 text-xs">*</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400">
            <option value=""> Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address / District
            </label>
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded px-3 py-2">
              <option value="">All</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        {/* Phone Number */}
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

        {/* Who are you visiting? */}
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

        {/* Reason */}
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

        {/* Time In */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Time In <span className="text-red-400 text-xs">*</span>
          </label>
          <input
            type="time"
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>

        {/* Time Out */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Time Out (Optional)
          </label>
          <input
            type="time"
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
            placeholder="Any other details you'd like to add"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-sky-400 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-opacity-50 transition duration-200 cursor-pointer disabled:cursor-not-allowed disabled:bg-sky-400"
          disabled={isLoading}>
          {isLoading ? "Saving..." : "Save & Check In"}
        </button>

        <div className="mt-6 flex items-center space-x-2">
          <MdOutlineAnnouncement className="text-red-500 text-2xl" />
          <p className="text-gray-600 text-sm">
            Your data is securely stored and used only for visitor tracking
            purposes.
          </p>
        </div>
      </form>
    </div>
    </>
  );
};
