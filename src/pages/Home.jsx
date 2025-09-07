import React, { useState, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { Link, useNavigate } from "react-router";
import Dashboard from "../assets/Dashboard.png";
import { CiPlay1 } from "react-icons/ci";

export const Home = () => {
  const [showVideo, setShowVideo] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-[#141414] text-white" : "bg-white text-gray-900"
      }`}>
      <section className="py-20 sm:pt-20 text-center px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold">
            Seamless Visitor Experience, Powerful Admin Control
          </h1>

          <p className="mt-5 text-4xl font-bold leading-tight sm:leading-tight sm:text-5xl lg:text-5xl lg:leading-tight font-pj">
            Transform your{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur opacity-30" />
              <span className="relative">visitor logs</span>
            </span>{" "}
            into intelligent, actionable insights.
          </p>
          {/* call to actions */}
          <div className="mt-10 flex flex-col mx-auto sm:flex-row justify-center gap-4">
            <Link
                to="/dashboard"
              className={`px-6 py-3 text-lg cursor-pointer font-bold rounded-xl transition-all duration-200 font-pj border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto
                  ${
                    isDark
                      ? "bg-white text-black border-transparent hover:bg-gray-200 focus:ring-white"
                      : "bg-gray-900 text-white border-transparent hover:bg-gray-600 focus:ring-gray-900"
                  }`}>
              Launch Dashboard
            </Link>

            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`flex items-center justify-center px-6 py-3 text-lg cursor-pointer font-bold rounded-xl transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 font-pj
                    ${
                      isDark
                        ? "text-white border-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:border-white"
                        : "text-gray-900 border-gray-400 hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white focus:border-gray-900"
                    }`}>
              <CiPlay1 className="mr-2" size={23} />{" "}
              {showVideo ? "Hide Video" : "Watch Demo"}
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Streamlined check-ins. Instant reports. Role-based control. 100%
            digital.
          </p>
        </div>

        {/* Image/Video */}
        <div className="mt-12 relative max-w-5xl mx-auto">
          {showVideo ? (
            <video
              controls
              autoPlay
              className="w-full  mx-auto rounded-xl z-10 relative"
              src="https://cdn.rareblocks.xyz/collection/clarity/videos/marketing.mp4"
            />
          ) : (
            <div
              className="relative w-full mx-auto cursor-pointer"
              onClick={() => setShowVideo(true)}>
              {/* Gradient blur bg */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-xl opacity-50 z-0" />
              {/* Image */}
              <img
                src={Dashboard}
                alt="Dashboard Preview"
                className="w-full object-cover rounded-xl relative z-10"
              />
              {/* Play Icon */}
              <div className="absolute inset-0 z-20 flex justify-center items-center">
                <div className="bg-white/80 text-black rounded-full p-3 shadow-lg">
                  <CiPlay1 className="text-2xl" size={45} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold mb-2">🧑‍💼 Role-Based Access</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Super Admins, Admins, and Receptionists — each role has its own
              permissions and views.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              📊 Smart Filters & Exports
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Filter by gender, date, district, or keyword. Export check-in data
              to Excel or CSV.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              📱 QR-Based Registration
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Visitors scan and register themselves with a QR code — no
              receptionist needed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
