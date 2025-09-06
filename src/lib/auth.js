// Updated Supabase Auth functions for Visitor System

import supabase from "./supabase";

// Admin access email to match upon login
const superAdminEmail = "mabdirahim832@gmail.com";


// Signup Function - only needed once manually or via script for admin
export const signUp = async (email, password, username = "") => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  console.log("SignUp Result", data, error);

  if (error) throw error;

  return data;
};


// Signin Function
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (data?.user) {
    try {
      const profile = await getUserProfile(data.user.id);
      console.log("Profile info", profile);
    } catch (profileError) {
      console.error("Error with profile during signin:", profileError);
    }
  }

  return data;
};


// Get User Profile or Create If Not Exist
// export const getUserProfile = async (userID) => {
//   // Try to fetch existing profile
//   const { data: profile, error } = await supabase
//     .from("users")
//     .select("*")
//     .eq("id", userID)
//     .maybeSingle();

//   if (profile) return profile;

//   if (error && error.code === "PGRST116") {
//     // No profile exists, create it
//     const { data: userData, error: userError } = await supabase.auth.getUser();
//     if (userError || !userData?.user?.email) throw new Error("Failed to get email");
//     console.log("Creating new profile for user:", userData.user);
//     const email = userData.user.email;
//     const username = email.split("@")[0];
//     const isSuperAdmin = email === superAdminEmail;
//     console.log("Super Admin:", superAdminEmail, "Email:", email);
//     console.log("Is Super Admin:", isSuperAdmin);

//     const { data: newProfile, error: insertError } = await supabase
//       .from("users")
//       .insert({
//         id: userID,
//         username,
//         email,
//         created_by: userID,
//         avator_url: null,
//         role: isSuperAdmin ? "super_admin" : "visitor",
//         role_protected: isSuperAdmin,
//       })
//       .select()
//       .maybeSingle();

//     if (insertError) throw insertError;

//     return newProfile;
//   }

//   if (error) throw error;

//   throw new Error("Unexpected error in getUserProfile");
// };

export const getUserProfile = async (userID) => {
  // Try to fetch existing profile
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userID)
    .maybeSingle();

  if (error) throw error; // catch real query errors

  if (profile) return profile; // found profile

  // no profile exists → create one
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.email) {
    throw new Error("Failed to get email");
  }

  const email = userData.user.email;
  const username = email.split("@")[0];
  const isSuperAdmin = email === superAdminEmail; // make sure superAdminEmail is defined!

  const { data: newProfile, error: insertError } = await supabase
    .from("users")
    .insert({
      id: userID,
      username,
      email,
      created_by: userID,
      avator_url: null,
      role: isSuperAdmin ? "super_admin" : "visitor",
      role_protected: isSuperAdmin,
    })
    .select()
    .maybeSingle();

  if (insertError) throw insertError;

  return newProfile;
};




// Auth state change listener
export const onAuthChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event);
  });

  return () => data.subscription.unsubscribe();
};

// Sign Out
export const SignOut = async () => {
  await supabase.auth.signOut();
};
