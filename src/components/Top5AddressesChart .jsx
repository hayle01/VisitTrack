import  { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FiAlertCircle, FiBarChart2, FiLoader } from "react-icons/fi";
import { getTopAddresses } from "../lib/visitors";
import { useTheme } from "../Context/ThemeContext"; // Adjust import path if needed

const COLORS = ["#A5B4FC", "#6EE7B7", "#D1D5DB", "#93C5FD", "#86EFAC"]; // lighter shades for dark bg

const formatNumber = (value) => {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value;
};

export const Top5AddressesChart = () => {
  const { theme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTopAddresses();
        setData(result);
      } catch (error) {
        console.error("Error fetching top addresses data:", error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      className={`w-full h-full rounded-lg p-4 border ${
        isDark
          ? "bg-[#1A1A1A] border-[#262626] text-gray-200"
          : "bg-white border-gray-300 text-gray-900"
      }`}
    >
      <h3 className="font-semibold mb-4 text-lg">Top 5 Districts</h3>

      {loading ? (
        <div className="flex justify-center items-center h-[250px] text-blue-500">
          <FiLoader className="text-3xl animate-spin" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[250px] text-red-500">
          <FiAlertCircle className="text-3xl" />
          <span className="ml-2">{error}</span>
        </div>
      ) : !data ||
        data.length === 0 ||
        data.every((item) => item.count === 0) ? (
        <div className="flex justify-center items-center h-[250px] text-gray-500">
          <FiBarChart2 className="text-3xl text-gray-400" />
          <span className="ml-2">No data available</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -40, bottom: 30 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: isDark ? "#D1D5DB" : "#4B5563" }}
              tickMargin={5}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fontSize: 12, fill: isDark ? "#D1D5DB" : "#4B5563" }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => formatNumber(value)}
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: isDark ? "#262626" : "#fff",
                  borderColor: isDark ? "#444" : "#ccc",
                  color: isDark ? "#eee" : "#000",
              }}
              itemStyle={{ color: isDark ? "#eee" : "#000" }}
              labelStyle={{ color: isDark ? "#aaa" : "#666" }}
            />
            <Bar
              dataKey="count"
              barSize={15}
              radius={[5, 5, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
