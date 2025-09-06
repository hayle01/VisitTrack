import dayjs from "dayjs";
import supabase from "./supabase";

export const createVisitor = async (visitor) => {
  let user_id = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    user_id = user?.id || null;
  } catch (err) {
    console.warn("Unauthenticated insert");
  }

  const visitorData = {
    fullname: visitor.fullname,
    phone_number: visitor.phone_number,
    visiting: visitor.visiting,
    reason: visitor.reason,
    timeIn: visitor.timeIn,
    timeOut: visitor.timeOut,
    notes: visitor.notes,
    gender: visitor.gender,
    address: visitor.address,
    user_id: user_id,
  };

  const { error } = await supabase.from("visitors").insert(visitorData).select('*').single();

  if (error) {
    console.error("Insert error:", error);
    throw new Error("Insert failed");
  }

  return visitorData;
};


export const updateVisitor = async (visitorId, data) => {

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

 
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("User profile not found");
  }

  if (!["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Permission denied");
  }


  const { error, updated } = await supabase
    .from("visitors")
    .update(data)
    .eq("id", visitorId)
    .select('*')
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    throw new Error(error.message || "Update failed");
  }

  return updated;
};

export const getVisitorsByPage = async (
  page = 1,
  limit = 10,
  debouncedSearch,
  gender,
  address,
  dateRange,
  dateFilterEnabled,
  userRole
) => {

  if (!userRole) {
    //  Block access if role is null
    throw { code: "ACCESS_DENIED", message: "User does not have access" };
  }
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("visitors")
    .select(
      `
        *,
        users (
          username,
          role,
          email
        )
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

    console.log("the data from querry:", query)
  // Search Filter
  if (debouncedSearch) {
    query = query.or(
      `fullname.ilike.%${debouncedSearch}%,phone_number.ilike.%${debouncedSearch}%,address.ilike.%${debouncedSearch}%`
    );
  }

  // Gender Filter
  if (gender) {
    query = query.eq("gender", gender);
  }

  // Address Filter
  if (address) {
    query = query.eq("address", address);
  }

  // Date Range Filter (on created_at)
  if (
    dateFilterEnabled &&
    dateRange?.[0]?.startDate &&
    dateRange?.[0]?.endDate
  ) {
    const start = dateRange[0].startDate.toISOString();
    const end = new Date(
      dateRange[0].endDate.getTime() + 86400000 - 1
    ).toISOString();
    query = query.gte("created_at", start).lte("created_at", end);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching visitors:", error);
    throw error;
  }

  const processedVisitors = data.map((visitor) => {
    let created_by;
    if (!visitor.user_id || !visitor.users) {
      created_by = "visitor";
    } else {
      created_by = {
        username: visitor.users.username,
        role: visitor.users.role,
      };
    }

    const { users, ...rest } = visitor;
    return {
      ...rest,
      created_by,
    };
  });

  return { visitors: processedVisitors, total: count };

};

export const deleteVisitor = async (id) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("User profile not found");
  }

  if (!["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Permission denied");
  }

  const { data, error } = await supabase.from("visitors").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

function formatDate(date, timeframe) {
  if (timeframe === "weekly") return dayjs(date).format("ddd");
  if (timeframe === "monthly") return dayjs(date).format("MMM D");
  if (timeframe === "yearly") return dayjs(date).format("MMM");
  return date;
}

// Fetch visitor trends
export const getVisitorTrends = async (timeframe = "weekly") => {
  const now = dayjs();
  let from;

  if (timeframe === "weekly") {
    from = now.subtract(6, "day").startOf("day");
  }
  if (timeframe === "monthly") {
    from = now.subtract(29, "day").startOf("day");
  }
  if (timeframe === "yearly") {
    from = now.subtract(11, "month").startOf("month");
  }

  const { data, error } = await supabase
    .from("visitors")
    .select("created_at")
    .gte("created_at", from.toISOString())
    .lte("created_at", now.endOf("day").toISOString());

  if (error) throw new Error("Failed to fetch visitor trends");

  const grouped = {};

  data.forEach((item) => {
    const label = formatDate(item.created_at, timeframe);
    grouped[label] = (grouped[label] || 0) + 1;
  });

  const sorted = Object.entries(grouped)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => dayjs(a.label).diff(dayjs(b.label)));

  return sorted;
};

export const getGenderCounts = async () => {
  const { data, error } = await supabase
    .from("visitors")
    .select("gender", { count: "exact", head: false });

  if (error) throw error;

  const genderCount = { male: 0, female: 0 };

  data.forEach((item) => {
    if (item.gender === "male") {
      genderCount.male += 1;
    } else if (item.gender === "female") {
      genderCount.female += 1;
    }
  });

  return genderCount;
};

export const getTopAddresses = async () => {
  const { data, error } = await supabase.rpc("get_top_5_addresses");

  if (error) {
    console.error("Error fetching top addresses:", error);
    throw error;
  }

  return data.map((item) => ({
    name: item.address,
    count: item.count,
  }));
};

export const getSummaryMetrics = async () => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];

  // Week Ranges
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const mondayThisWeek = new Date(now);
  mondayThisWeek.setDate(now.getDate() - dayOfWeek + 1);
  mondayThisWeek.setHours(0, 0, 0, 0);
  const mondayThisWeekISO = mondayThisWeek.toISOString();

  const mondayLastWeek = new Date(mondayThisWeek);
  mondayLastWeek.setDate(mondayThisWeek.getDate() - 7);
  const sundayLastWeek = new Date(mondayThisWeek);
  sundayLastWeek.setDate(mondayThisWeek.getDate() - 1);
  const mondayLastWeekISO = mondayLastWeek.toISOString();
  const sundayLastWeekISO = new Date(sundayLastWeek.setHours(23, 59, 59, 999)).toISOString();

  //  Total Visitors (All Time)
  const { count: totalVisitors = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true });

  //  Total Visitors (This Week vs Last Week) for % change only
  const { count: totalThisWeek = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .gte("created_at", mondayThisWeekISO);

  const { count: totalLastWeek = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .gte("created_at", mondayLastWeekISO)
    .lte("created_at", sundayLastWeekISO);

  const totalVisitorsChange = totalLastWeek
    ? Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100)
    : 0;

  //  Male Visitors (All Time)
  const { count: maleVisitors = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("gender", "male");

  //  Male % change
  const { count: maleThisWeek = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("gender", "male")
    .gte("created_at", mondayThisWeekISO);

  const { count: maleLastWeek = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("gender", "male")
    .gte("created_at", mondayLastWeekISO)
    .lte("created_at", sundayLastWeekISO);

  const maleVisitorsChange = maleLastWeek
    ? Math.round(((maleThisWeek - maleLastWeek) / maleLastWeek) * 100)
    : 0;

  //  Female Visitors (All Time)
  const { count: femaleVisitors = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("gender", "female");

  //  Female % change
  const { count: femaleThisWeek = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("gender", "female")
    .gte("created_at", mondayThisWeekISO);

  const { count: femaleLastWeek = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("gender", "female")
    .gte("created_at", mondayLastWeekISO)
    .lte("created_at", sundayLastWeekISO);

  const femaleVisitorsChange = femaleLastWeek
    ? Math.round(((femaleThisWeek - femaleLastWeek) / femaleLastWeek) * 100)
    : 0;

  // Today's Visitors
  const { count: todayVisitors = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);

  const { count: yesterdayVisitors = 0 } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${yesterdayDate}T00:00:00`)
    .lte("created_at", `${yesterdayDate}T23:59:59`);

  // const visitorsChange = yesterdayVisitors
  //   ? Math.round(((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100)
  //   : 0;
  let visitorsChange;
if (yesterdayVisitors > 0) {
  visitorsChange = Math.round(((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100);
} else if (todayVisitors > 0) {
  visitorsChange = 100; // or maybe "∞" if you want infinite growth
} else {
  visitorsChange = 0;
}


  //  Average Duration
  const { data: durationData } = await supabase.from("visitors").select("timeIn, timeOut");
  let averageDuration = "0m";
  if (durationData && durationData.length > 0) {
    const validDurations = durationData.filter((d) => d.timeIn && d.timeOut);
    if (validDurations.length > 0) {
      const totalDuration = validDurations.reduce((acc, curr) => {
        const timeInClean = curr.timeIn.split("+")[0];
        const timeOutClean = curr.timeOut.split("+")[0];
        let start = new Date(`${today}T${timeInClean}`);
        let end = new Date(`${today}T${timeOutClean}`);
        if (end < start) end.setDate(end.getDate() + 1);
        return acc + (end - start) / 60000;
      }, 0);
      averageDuration = `${Math.round(totalDuration / validDurations.length)}m`;
    }
  }

  //  Active Admins
  const { data: activeAdminsData } = await supabase
    .from("visitors")
    .select("user_id")
    .not("user_id", "is", null);
  const userIds = [...new Set(activeAdminsData.map((item) => item.user_id))];
  let activeAdmins = 0;
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, role")
      .in("id", userIds);
    activeAdmins = usersData.filter(
      (user) => user.role === "super_admin" || user.role === "receptionist" || user.role === "admin"
    ).length;
  }

  return {
    totalVisitors,
    totalVisitorsChange,
    maleVisitors,
    maleVisitorsChange,
    femaleVisitors,
    femaleVisitorsChange,
    todayVisitors,
    visitorsChange,
    averageDuration,
    activeAdmins,
  };
};

export const getCurrentUserRole = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("No authenticated user");
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

      console.log("User data:", userData)

    if (userError || !userData) {
      console.error("Failed to fetch user role:", userError);
      return null;
    }

    return userData.role;
  } catch (err) {
    console.error("Error getting current user role:", err);
    return null;
  }
};

