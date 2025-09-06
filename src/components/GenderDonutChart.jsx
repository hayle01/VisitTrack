import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getGenderCounts } from "../lib/visitors";
import { FiAlertCircle, FiBarChart2, FiLoader } from "react-icons/fi";
import { useTheme } from "../Context/ThemeContext"; // Adjust import path if needed

const COLORS = ["#aec7ed", "#82ca9d"];

export const GenderDonutChart = () => {
  const { theme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [genderData, setGenderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const counts = await getGenderCounts();
        const data = [
          { name: "Male", value: counts.male },
          { name: "Female", value: counts.female },
        ];
        setGenderData(data);
      } catch (error) {
        console.error(error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderLegendText = (value, entry) => {
    const total = genderData.reduce((sum, item) => sum + item.value, 0);
    const percentage =
      total === 0 ? 0 : ((entry.payload.value / total) * 100).toFixed(0);
    return `${value} ${percentage}%`;
  };

  return (
    <div
      className={`w-full h-full rounded-lg p-4 border ${
        isDark
          ? "bg-[#1A1A1A] border-[#262626] text-gray-200"
          : "bg-white border-gray-300 text-gray-900"
      }`}
    >
      <h2 className="text-lg font-semibold mb-2">Gender Distribution</h2>

      {loading ? (
        <div className="flex justify-center items-center h-[250px] text-blue-500">
          <FiLoader className="text-3xl animate-spin" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[250px] text-red-500">
          <FiAlertCircle className="text-3xl" />
          <span className="ml-2">{error}</span>
        </div>
      ) : !genderData ||
        genderData.length === 0 ||
        genderData.every((item) => item.value === 0) ? (
        <div className="flex justify-center items-center h-[250px] text-gray-500">
          <FiBarChart2 className="text-3xl text-gray-400" />
          <span className="ml-2">No gender data available.</span>
        </div>
      ) : (
        <div className="w-full h-[220px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                innerRadius="40%"
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="top"
                height={1}
                formatter={renderLegendText}
                iconSize={8}
                wrapperStyle={{
                  color: isDark ? "#ddd" : "#000",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#262626" : "#fff",
                  borderColor: isDark ? "#444" : "#ccc",
                  color: isDark ? "#eee" : "#000",
                }}
                itemStyle={{ color: isDark ? "#eee" : "#000" }}
                labelStyle={{ color: isDark ? "#aaa" : "#666" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
