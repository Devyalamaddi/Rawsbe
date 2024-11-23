import { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import BlogCard from "../Blogs/BlogCard";
import { TbHttpDelete } from "react-icons/tb";
import { UserContextObj } from "../../context/UserContext";
import Profile from "../Profile";  // Import the Profile component

export default function Dashboard() {
  const [userBlogs, setUserBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useContext(UserContextObj);
  const [isEditing, setIsEditing] = useState(false); // State to control profile edit visibility

  const token = localStorage.getItem("token");
  const payload = useMemo(() => (token ? JSON.parse(atob(token.split('.')[1])) : null), [token]);

  useEffect(() => {
    if (payload?.role === 'admin') {
      fetchUsers();
    }
    fetchUserBlogs();
  }, [payload]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:1234/user-api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.payload || []);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:1234/user-api/deleteuser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError(null);
  
      // Fetch updated users list after deletion
      await fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Error deleting user");
      console.error("Error deleting user:", error);
    }
  };

  const fetchUserBlogs = async () => {
    if (!payload?.userId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:1234/user-api/blogs${isAdmin ? "/admin" : `/user/${payload.userId}`}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserBlogs(response.data.payload || []);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching blogs");
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (payload?.role === 'admin') {
      fetchUsers();
    }
    fetchUserBlogs();
  }, []);

  if (!payload) {
    return <div className="p-4">Please log in to view dashboard</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">
        {payload.role === 'admin' ? "Admin Dashboard" : "Dashboard"}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">Loading...</div>
      ) : (
        <>
          {/* Profile Section at the Top */}
          <section className="mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{payload?.name}</h2>
                <p className="text-sm text-gray-500">{payload?.email}</p>
              </div>
              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Edit Profile
              </button>
            </div>
            {isEditing && (
              <Profile 
                setIsEditing={setIsEditing} // Pass the function to Profile component
              />
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">
              {isAdmin ? "Flagged Blogs" : "Your Blogs"}
            </h2>
            {userBlogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBlogs.map((blog) => (
                  <BlogCard key={blog.BLOGID} blog={blog} refreshBlogs={fetchUserBlogs} />
                ))}
              </div>
            ) : (
              <p>Empty</p>
            )}
          </section>

          {/* Admin Section for Managing Users */}
          {payload.role === 'admin' && (
            <section>
              <h2 className="text-xl font-bold mb-4">Users List</h2>
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user[0]}>
                          <td className="px-6 py-4 whitespace-nowrap">{user[0]}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user[1]}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user[2]}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteUser(user[0])}
                              className="bg-red-500/60 px-4 py-2 rounded text-white ease-in-out transition-colors duration-300 hover:bg-black hover:text-red-600/90"
                            >
                              <TbHttpDelete />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No users found</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
