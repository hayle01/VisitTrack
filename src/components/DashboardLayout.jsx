import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { FiUser, FiUsers, FiHome, FiList, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import Logo from "../assets/Logo.svg";
import ThemeToggle from "./ThemeToggle";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { TbReport } from "react-icons/tb";
import { useAuth } from "../Context/authContext";
import { useTheme } from "../Context/ThemeContext";


const DashboardLayout = () => {
  const { theme } = useTheme();
  const { profile, Logout} = useAuth();
  // console.log("Profile in DashboardLayout:", profile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const currentYear = new Date().getFullYear();

  return (
    <div
      className={`h-screen flex overflow-hidden ${
        isDark ? "bg-[#141414] text-white" : "bg-white text-black"
      }`}>
      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-40 flex flex-col
          border-r transition-all duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
          ${sidebarCollapsed ? "md:w-16" : "md:w-50"}
          h-screen
          ${
            isDark
              ? "bg-[#141414] border-r-[#262626]"
              : "bg-white border-r-gray-300"
          }
        `}>
        {/* Logo & Close sidebar button */}
        <div
          className={`flex items-center justify-between p-3 border-b ${
            isDark ? "border-b-[#262626]" : "border-gray-300"
          }`}>
          <div className="flex items-center gap-2 p-1">
            <img src={Logo} className="w-8 h-8" alt="LOGO" />
            {!sidebarCollapsed && (
              <h1 className="font-bold text-lg">
                {/* Text color inherited */}VisitTrack
              </h1>
            )}
          </div>

          {/* Close for Mobile */}
          <button
            className={`${
              isDark ? "text-white" : "text-gray-600"
            } md:hidden cursor-pointer`}
            onClick={() => setSidebarOpen(false)}>
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 ${
            sidebarCollapsed ? "p-2" : "p-4"
          } overflow-hidden`}>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-3 cursor-pointer rounded transition
                    ${
                      isActive
                        ? isDark
                          ? "bg-[#1A1A1A] border border-[#262626] font-semibold text-white"
                          : "bg-gray-200 font-semibold text-black"
                        : isDark
                        ? "text-white hover:bg-[#262626]"
                        : "text-gray-900 hover:bg-gray-200"
                    }`
                }>
                <FiHome className="text-lg" />
                {!sidebarCollapsed && <span>Overview</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/manage-visitors"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-3 cursor-pointer rounded transition
                    ${
                      isActive
                        ? isDark
                          ? "bg-[#1A1A1A] border border-[#262626] font-semibold text-white"
                          : "bg-gray-200 font-semibold text-black"
                        : isDark
                        ? "text-white hover:bg-[#262626]"
                        : "text-gray-900 hover:bg-gray-200"
                    }`
                }>
                <FiList className="text-lg" />
                {!sidebarCollapsed && <span>Visitors</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/report"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-3 cursor-pointer rounded transition
                    ${
                      isActive
                        ? isDark
                          ? "bg-[#1A1A1A] border border-[#262626] font-semibold text-white"
                          : "bg-gray-200 font-semibold text-black"
                        : isDark
                        ? "text-white hover:bg-[#262626]"
                        : "text-gray-900 hover:bg-gray-200"
                    }`
                }>
                <TbReport className="text-lg" />
                {!sidebarCollapsed && <span>Reports</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/manage-users"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-3 cursor-pointer rounded transition
                    ${
                      isActive
                        ? isDark
                          ? "bg-[#1A1A1A] border border-[#262626] font-semibold text-white"
                          : "bg-gray-200 font-semibold text-black"
                        : isDark
                        ? "text-white hover:bg-[#262626]"
                        : "text-gray-900 hover:bg-gray-200"
                    }`
                }>
                <FiUsers className="text-lg" />
                {!sidebarCollapsed && <span>Manage Users</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
        {/* Logout */}
        <div
          className={`p-4 border-t justify-end ${
            isDark ? "border-t-[#262626]" : "border-t-gray-300"
          }`}>
          <button
            onClick={Logout}
            className={`flex items-center ${!sidebarCollapsed && 'w-full'}  gap-3 py-2 px-3 cursor-pointer rounded transition
                    ${
                      isDark
                        ? "bg-[#1A1A1A] border hover:bg-[#262626] border-[#262626] text-white"
                        : "bg-white hover:bg-gray-100  text-black"
                    }`}>
            <FiLogOut  className="text-lg" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div
          className={`sticky top-0 z-30 flex items-center justify-between p-[15px] border-b
          ${
            isDark
              ? "bg-[#141414] border-[#262626] text-white"
              : "bg-white border-gray-300 text-black"
          }`}>
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              className={`${
                isDark ? "text-white" : "border-[#262626]"
              } md:hidden cursor-pointer`}
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu className="text-2xl" />
            </button>

            {/* Desktop sidebar collapse toggle */}
            <button
              className={`${
                isDark ? "text-white" : "text-gray-600"
              } hidden md:block cursor-pointer`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? (
                <GoSidebarCollapse className="text-2xl" />
              ) : (
                <GoSidebarExpand className="text-2xl" />
              )}
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div
              className={`flex items-center gap-2 ${
                isDark ? "text-white" : "text-black"
              }`}>
              <div>
                <span>Hello, {profile?.username}</span>
              </div>
              <Link
                to="profile"
                className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                {profile.avator_url !== null ? (
                  <img
                    src={profile.avator_url}
                    className="w-7 h-7 object-cover border border-gray-200 rounded-full"
                    alt="Profile"
                  />
                ) : (
                  <FiUser className="w-7 h-7" />
                )}
              </Link>
              {/* <span className="hidden md:inline-flex">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                </span> */}
            </div>
          </div>
        </div>

        {/* Main content outlet */}
        <main
          className={`${
            isDark ? "bg-[#141414] text-white" : "bg-gray-100 text-gray-900"
          } flex-1 overflow-y-auto p-4`}>
          <Outlet />
        </main>

        {/* Footer */}
        {/* <footer
          className={`p-2 text-sm text-center border-t
          ${isDark ? "border-[#262626] bg-[#141414] text-gray-400" : "border-gray-200 text-gray-600 bg-transparent"}`}
        >
          &copy; {currentYear} NIC
        </footer> */}
      </div>
    </div>
  );
};

export default DashboardLayout;
