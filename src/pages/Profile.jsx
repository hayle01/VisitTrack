import React, { useEffect, useState } from "react";
import {
  FiCamera,
  FiMail,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiSave,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { getUserProfile } from "../lib/auth";
import supabase from "../lib/supabase";
import { useAuth } from "../Context/authContext";
import { useTheme } from "../Context/ThemeContext";

export const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [role, setRole] = useState(null);
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [lastEdit, setLastEdit] = useState("");
  const [originalProfile, setOriginalProfile] = useState({});

  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const {
        username,
        avator_url,
        role,
        phoneNumber,
        DateofBirth,
        Address,
        updated_at,
      } = await getUserProfile(user.id);

      const profile = {
        username,
        avator_url,
        phoneNumber: phoneNumber || "",
        DateofBirth: DateofBirth || "",
        Address: Address || "",
      };

      setUsername(profile.username);
      setAvatarUrl(profile.avator_url);
      setRole(role);
      setPhone(profile.phoneNumber);
      setDob(profile.DateofBirth);
      setAddress(profile.Address);
      setLastEdit(updated_at || "");
      setOriginalProfile(profile);
      setAvatar(null);
      setEditing(false);
    } catch (error) {
      console.error("Error fetching user profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size is too large", {
          duration: 2000,
          position: "top-right",
        });
        return;
      }
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const hasChanges = () => {
    return (
      username !== originalProfile.username ||
      phone !== originalProfile.phoneNumber ||
      dob !== originalProfile.DateofBirth ||
      address !== originalProfile.Address ||
      avatar !== null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges()) {
      toast.error(
        "No changes detected. Please update a field or cancel editing."
      );
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let updates = {
        username,
        phoneNumber: phone,
        DateofBirth: dob,
        Address: address,
        updated_at: new Date().toISOString(),
      };

      if (avatar) {
        const fileExt = avatar.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()
          .toString(36)
          .substring(2)}`;
        const filePath = `avators/${fileName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avators")
          .upload(filePath, avatar, { upsert: true });

        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          throw uploadError;
        }

        const { data: avatardata } = supabase.storage
          .from("avators")
          .getPublicUrl(filePath);
        updates.avator_url = avatardata.publicUrl;
        setAvatarUrl(avatardata.publicUrl);
      }

      console.log("Updates being sent:", updates);
      // Update user profile in the database
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select("username, avator_url, updated_at")
        .single();
      if (error) throw error;

      setLastEdit(data?.updated_at);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      toast.error(error.message || "Error updating user profile");
    } finally {
      setLoading(false);
    }
  };

  if (role === "super_admin") {
    setRole("Super Admin");
  }

  return (
    <div
      className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 ${
        isDark ? "bg-[#141414] text-gray-100" : "text-gray-900"
      }`}>
      <div className="max-w-4xl mx-auto">
        <div
          className={`shadow rounded-md overflow-hidden border ${
            isDark
              ? "bg-[#1A1A1A] border-[#262626]"
              : "bg-white border-gray-300"
          }`}>
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium">Your Profile</h2>
                {lastEdit && (
                  <p className="text-sm text-gray-400">
                    Last edit on {new Date(lastEdit).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(!editing)}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded border text-sm ${
                    isDark
                      ? "bg-[#1A1A1A] border-[#262626] text-gray-200 hover:bg-[#231f1f]"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}>
                  <FiEdit2 /> {editing ? "Discard" : "Edit Profile"}
                </button>

                {/* Action Buttons */}
                {editing && (
                  <button
                    type="submit"
                    disabled={loading || !hasChanges()}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm text-white
                    ${
                      loading || !hasChanges()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-sky-600 hover:bg-sky-700"
                    }
                    `}>
                    <FiSave />
                    {loading ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </div>
            <div className="md:flex gap-6 items-start">
              {/* Avatar */}
              <div className="relative group md:w-1/5 w-full flex-shrink-0 flex justify-center items-center mb-6 md:mb-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-full h-full" />
                  )}
                </div>
                {editing && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:scale-110">
                      <FiCamera className="w-5 h-5 text-sky-600" />
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!editing}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${
                      isDark
                        ? "bg-[#1A1A1A] border-[#262626] text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={`w-full px-3 py-2 rounded border  cursor-not-allowed ${
                      isDark
                        ? "bg-[#1A1A1A] border-[#262626] text-gray-400"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  />
                </div>
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={role ? role : " Visitor"}
                    disabled
                    className={`w-full px-3 py-2 rounded border  cursor-not-allowed capitalize ${
                      isDark
                        ? "bg-[#1A1A1A] border-[#262626] text-gray-400"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!editing}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${
                      isDark
                        ? "bg-[#1A1A1A] border-[#262626] text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={!editing}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${
                      isDark
                        ? "bg-[#1A1A1A] border-[#262626] text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!editing}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${
                      isDark
                        ? "bg-[#1A1A1A] border-[#262626] text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
