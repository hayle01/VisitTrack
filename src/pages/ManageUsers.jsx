// Enhanced version of ManageUsers with better UI, role-based logic, and cleaner pagination
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { useTheme } from "../Context/ThemeContext";
import {
  deleteUser,
  fetchUsers,
  updateUserRole,
  createUser,
} from "../lib/users";
import { Loading } from "../components/Loading";
import { CiSearch } from "react-icons/ci";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FiLoader, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import {supabase} from "../lib/supabase.js";

export const ManageUsers = () => {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const filteredUsers = users.filter(
    (user) =>
      (user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter ? user.role === roleFilter : true)
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const [userToDelete, setuserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Optimistic update hook
    const [optimisticUsers, updateOptimisticUsers] = useOptimistic(
      users,
      (state, id) => state.filter((user) => user.id !== id)
    );
    const [isPending, startTransition] = useTransition();

    // Open delete confirmation modal
  const confirmDelete = (user) => setuserToDelete(user);

  // Delete visitor with optimistic update
  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    startTransition(() => updateOptimisticUsers(userToDelete.id));
    try {
      // const { data: sessionData } = await supabase.auth.getSession();
      // console.log("Session Token:", sessionData?.session?.access_token);
      // console.log("Current UID (decoded):", sessionData?.session?.user?.id);

      const { data: currentUser, error: authError } =
        await supabase.auth.getUser();
      if (authError) throw authError;
      const currentUserId = currentUser?.user?.id;
      console.log("Current user ID:", currentUserId);
      console.log("Trying to delete:", {
        currentUserId,
        targetUserId: userToDelete.id,
      });
      await deleteUser(userToDelete.id);
      setVisitors((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success("User deleted.");
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || "Failed to delete user.");
      loadUsers(); 
    } finally {
      setuserToDelete(null);
      setIsDeleting(false);
    }
  };

  // const handleDelete = async (userId) => {
  //   if (!confirm("Are you sure you want to delete this user?")) return;
  //   try {
  //     await deleteUser(userId);
  //     setUsers((prev) => prev.filter((user) => user.id !== userId));
  //   } catch (error) {
  //     alert(error.message);
  //   }
  // };

    // Disable scrolling when any modal is open
    useEffect(() => {
      if (userToDelete) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }, [userToDelete]);

  return (
    <div
      className={`p-4 ${
        isDark ? "bg-[#141414] text-gray-100" : "bg-transparent text-gray-900"
      }`}>
      <div>
        <h1 className="text-xl font-medium mb-1">Manage Users</h1>
        <p className={` ${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
          Here you can manage all users, change roles, and delete accounts.
        </p>
      </div>

      <div
        className={`border ${
          isDark
            ? "bg-[#1a1a1a] text-gray-100 border-[#262626]"
            : "bg-white text-gray-900 border-gray-300"
        } p-6 rounded-md`}>
        <div className="flex justify-end mb-4">
          {/* <button
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Create User
          </button> */}
          <div className="flex gap-2">
            <div
              className={`flex items-center border px-2 rounded md:w-76 w-full ${
                isDark
                  ? "bg-[#141414] border-[#262626] text-gray-300"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              }`}>
              <CiSearch
                size={23}
                className={`${isDark ? "text-gray-200" : "text-[#64748B]"}`}
              />
              <input
                type="text"
                placeholder="Search by username/email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 p-2 w-full outline-none bg-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`border px-2 rounded outline-none cursor-pointer ${
                isDark
                  ? "bg-[#141414] border-[#262626] text-gray-300"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              }`}>
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="receptionist">Receptionist</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${
                isDark ? "divide-[#262626]" : "divide-gray-200"
              }`}>
              <thead
                className={`${
                  isDark ? "text-gray-100" : "text-gray-600"
                } uppercase text-sm`}>
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Avatar</th>
                  <th className="px-4 py-3 text-left font-medium">Username</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-[#262626]" : "divide-gray-200"
                }`}>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`${
                      isDark ? "hover:bg-[#0F0F0F]" : "hover:bg-gray-50"
                    }`}>
                    <td className="p-2">
                      {user?.avatar_url ? (
                        <img
                          src={user?.avatar_url}
                          alt="avatar"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <IoPersonCircleOutline
                          size={32}
                          className={`text-gray-500 ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">
                      {user.email || "example@gmail.com"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`border p-2 rounded outline-none cursor-pointer ${
                          isDark
                            ? "bg-[#141414] border-[#262626] text-gray-300"
                            : "bg-gray-50 text-gray-900 border-gray-300"
                        }`}
                        disabled={user.role === "super_admin"}>
                        {user.role === "super_admin" && (
                          <option value="super_admin">Super Admin</option>
                        )}
                        <option value="admin">Admin</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="visitor">Visitor</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 ">
                      
                          <button
                            onClick={() => confirmDelete(user)}
                            className="text-red-600 hover:text-red-800 cursor-pointer hover:bg-red-50 p-2 rounded-full"
                            title="Delete"
                            >
                            <FiTrash2 />
                          </button>
                       
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded">
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
            {userToDelete && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex justify-center items-center p-4">
                <div className={`${isDark ? 'bg-[#1A1A1A] border-[#262626] text-gray-200' : 'bg-white border-gray-400 text-gray-700'} rounded-xl p-6 max-w-sm w-full shadow-lg`}>
                  <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h2>
                  <p className="mb-6">Are you sure you want to delete {userToDelete.username} ?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setuserToDelete(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                      {isDeleting ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="mr-2" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
      
    </div>
  );
};
