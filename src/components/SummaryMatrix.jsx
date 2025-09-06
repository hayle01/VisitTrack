import React, { useEffect, useState } from "react";
import { SummaryCard } from "./SummaryCard";
import { FiUsers, FiUser, FiClock, FiCalendar, FiShield } from "react-icons/fi";
import { getSummaryMetrics } from "../lib/visitors";

const SummaryMatrix = () => {
  const [metrics, setMetrics] = useState({
    totalVisitors: 0,
    maleVisitors: 0,
    femaleVisitors: 0,
    averageDuration: "0m",
    todayVisitors: 0,
    activeAdmins: 0,
    visitorsChange: 0,
    totalVisitorsChange: 0,
    maleVisitorsChange: 0,
    femaleVisitorsChange: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await getSummaryMetrics();
      setMetrics(data);
    };
    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Visitors"
        value={metrics.totalVisitors}
        icon={FiUsers}
        percentage={metrics.totalVisitorsChange}
        isPositive={metrics.totalVisitorsChange >= 0}
        comparisonText="From Last 7 Days"
        bgColor="bg-[#ddf9ea]"
        iconColor="text-[#4AD991]"
      />

      <SummaryCard
        title="Male Visitors"
        value={metrics.maleVisitors}
        icon={FiUser}
        percentage={metrics.maleVisitorsChange}
        isPositive={metrics.maleVisitorsChange >= 0}
        comparisonText="From Last 7 Days"
        bgColor="bg-[#EDEEFC]"
        iconColor="text-[#7e87ff]"
      />

      <SummaryCard
        title="Female Visitors"
        value={metrics.femaleVisitors}
        icon={FiUser}
        percentage={metrics.femaleVisitorsChange}
        isPositive={metrics.femaleVisitorsChange >= 0}
        comparisonText="From Last 7 Days"
         bgColor="bg-[#E6F1FD]"
        iconColor="text-[#63adff]"
      />

      <SummaryCard
        title="Average Visit Duration"
        value={metrics.averageDuration}
        icon={FiClock}
        bgColor="bg-[#ffdccf]"
        iconColor="text-[#FF9066]"
      />

      <SummaryCard
        title="Today's Visitors"
        value={metrics.todayVisitors}
        icon={FiCalendar}
        percentage={metrics.visitorsChange}
        isPositive={metrics.visitorsChange >= 0}
        comparisonText="Since Yesterday"
        bgColor="bg-[#fff5dc]"
        iconColor="text-[#FEC53D]"
      />

      <SummaryCard
        title="Active Admins"
        value={metrics.activeAdmins}
        icon={FiShield}
         bgColor="bg-[#ededfc]"
        iconColor="text-[#8280FF]"
      />
    </div>
  );
};

export default SummaryMatrix;
