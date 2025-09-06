// App.jsx

import React from "react";
import { AuthContextProvider } from "./Context/authContext";

import { Route, Routes } from "react-router";
import { VisitorForm } from "./components/VisitorForm";
import { UnauthenticatedRoute } from "./components/UnauthenticatedRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { Toaster } from "react-hot-toast";
import ManageVisitors from "./pages/ManageVisitors";
import { ManageUsers } from "./pages/ManageUsers";
import DashboardLayout from "./components/DashboardLayout";
import { Overview } from "./pages/Overview";
import { ThemeProvider } from "./Context/ThemeContext";
import NotFound from "./components/NotFound";
import { Report } from "./pages/Report";
import {supabase} from "./lib/supabase.js";
import { Profile } from "./pages/Profile";
import { Home } from "./pages/Home";
import { MainLayout } from "./components/MainLayout";


supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    supabase.auth.setSession(session);
  }
});


function App() {
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <div>
          <main className="max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="profile" element={<Profile />} />
                <Route path="visitor-form" element={<VisitorForm />} />
                <Route
                path="/login"
                element={
                  <UnauthenticatedRoute>
                    <SignIn />
                  </UnauthenticatedRoute>
                }
              />
                <Route path="signup" element={<SignUp />} />
                <Route
                path="/signUp"
                element={
                  <UnauthenticatedRoute>
                    <SignUp />
                  </UnauthenticatedRoute>
                }
              />
              </Route>

              {/* Protected Admin dashboard Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoutes>
                    <DashboardLayout />
                  </ProtectedRoutes>
                }>
                <Route index element={<Overview />} />
                <Route path="manage-visitors" element={<ManageVisitors />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="report" element={<Report />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default App;
