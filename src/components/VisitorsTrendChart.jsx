import { useEffect, useState } from "react";
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { getVisitorTrends } from "../lib/visitors";
import { FiAlertCircle, FiBarChart2, FiLoader } from "react-icons/fi";
import { useTheme } from "../Context/ThemeContext";

export const VisitorTrendsChart = () => {
  const { theme } = useTheme();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getVisitorTrends(timeframe);
        setData(result);
      } catch (error) {
        console.error("Error fetching Trend Visitors data:", error);
        setError("Error fetching Trend Visitors data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeframe]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`w-full h-full rounded-lg p-4 border ${
        isDark
          ? "bg-[#1A1A1A] border-[#262626] text-gray-200"
          : "bg-white border-gray-300 text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Visitor Trends ({timeframe})</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className={`border rounded px-2 py-1 ${
            isDark
              ? "border-[#262626] bg-[#1A1A1A] text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              : "border-gray-300 text-gray-500"
          }`}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-[250px] text-blue-500">
          <FiLoader className="animate-spin text-3xl" />
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
          <FiBarChart2 className="text-gray-400 text-3xl" />
          <span className="ml-2">No data available</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -35,
              bottom: isMobile ? 60 : 10,
            }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1EA7FF" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1EA7FF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              tickMargin={10}
              interval="preserveStartEnd"
              tickLine={false}
              stroke={isDark ? "#ccc" : "#000"}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              interval="preserveStartEnd"
              stroke={isDark ? "#ccc" : "#000"}
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
            <Area
              type="monotone"
              dataKey="count"
              stroke="#1EA7FF"
              strokeWidth={2}
              dot={{ r: 1 }}
              fill="url(#areaGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
