import {supabase} from "./supabase.js";

// Get all users (excluding deleted and hiding super_admins from non-super_admins)
export const fetchUsers = async () => {
  const { data: currentUser, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", currentUser.user.id)
    .single();

  if (profileError) throw profileError;

  const isSuperAdmin = profile.role === "super_admin";

  const query = supabase.from("users")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!isSuperAdmin) query.neq("role", "super_admin");

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Update user role (admin/super_admin only)
export const updateUserRole = async (userId, newRole) => {
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", currentUser.user.id)
    .single();

  if (currentProfileError) throw currentProfileError;
  if (!['admin', 'super_admin'].includes(currentProfile.role)) throw new Error("Unauthorized");

  const { data, error: fetchError } = await supabase
    .from("users")
    .select("role_protected")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;
  if (data?.role_protected) throw new Error("Cannot change role of super admin");

  const { error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);

    console.log("Updating user role:", userId, "to", newRole);
  if (error) throw error;
};

// Soft delete user - frontend protected
export const deleteUser = async (userId) => {
  // 1. Get the current authenticated user
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const currentUserId = currentUser?.user?.id;
  console.log("Current User:", currentUser.user.email, currentUserId);
  if (!currentUserId) throw new Error("User not authenticated");

  // 2. Fetch current user's role
  const { data: currentUserProfile, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", currentUserId)
    .single();

  if (roleError) throw roleError;

  const currentUserRole = currentUserProfile?.role;
  console.log("Current User Role:", currentUserRole);
  if (!currentUserRole) throw new Error("Current user role not found");

  // 3. Only allow admin or super_admin to delete
  if (!["admin", "super_admin"].includes(currentUserRole)) {
    throw new Error("You are not authorized to delete users");
  }

  // 4. Fetch target user's role_protected and id
  const { data: targetUser, error: targetError } = await supabase
    .from("users")
    .select("role_protected")
    .eq("id", userId)
    .single();

  if (targetError) throw targetError;

  // 5. Prevent deleting super_admin accounts that are protected
  if (targetUser?.role_protected) {
    throw new Error("Cannot delete protected super admin");
  }

  // 6. Prevent super_admin from deleting themselves
  if (currentUserRole === "super_admin" && currentUserId === userId) {
    throw new Error("Super admin cannot delete their own account");
  }

  console.log("Target User:", targetUser);
  console.log("Hello, this is a soft delete operation.");
  console.log("Proceeding with soft delete for user:", userId);

  // 7. Proceed with soft delete
  const { error } = await supabase
  .from("users")
  .update({
    deleted_at: new Date().toISOString(),
    deleted_by: currentUserId
  })
  .eq("id", userId)
  .select("*"); // ✅ This triggers WITH CHECK


  if (error) throw error;
  console.log("User soft deleted successfully:", userId);
  return { success: true, message: "User soft deleted successfully" };
};


// Create user (admin or super_admin use only)
export const createUser = async (username, email, role, avatar_url = '') => {
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", currentUser.user.id)
    .single();

  if (profileError) throw profileError;
  if (!['admin', 'super_admin'].includes(profile.role)) throw new Error("Unauthorized");

  const { data, error } = await supabase.from("users").insert([
    {
      username,
      email,
      role,
      avatar_url,
      created_by: currentUser.user.id
    }
  ]);

  if (error) throw error;
  return data;
};

// Update own profile
export const updateOwnProfile = async (updates) => {
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, created_by")
    .eq("id", currentUser.user.id)
    .single();

  if (profileError) throw profileError;

  if (!profile.role || profile.created_by !== null) throw new Error("Not allowed to update profile");

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", currentUser.user.id);

  if (error) throw error;
};
