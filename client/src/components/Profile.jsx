import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Profile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const { userId } = currentUser;
  
  // State to store original user data and editable fields
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:1234/user-api/user/${userId}`);
        const { payload } = response.data;
        setUserData(prevState => ({
          ...prevState,
          name: payload[0],
          email: payload[1]
        }));
      } catch (error) {
        toast.error("Failed to fetch user data.");
      }
    };
    fetchUserData();
  }, [userId]);

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:1234/user-api/edituser/${userId}`,
        { 
          name: userData.name, 
          password: userData.password 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  // Handle the "Edit Profile" button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800 text-white flex items-center justify-center">
      <div className="container mx-auto px-6 py-10 text-center">
        <h1 className="text-4xl font-extrabold mb-6">Your Profile</h1>
        <p className="text-lg mb-8">Manage your account details and update your preferences.</p>

        <div className="bg-white text-black p-8 rounded-xl shadow-md max-w-xl mx-auto">
          <form className="space-y-6" onSubmit={handleUpdate}>
            <div>
              <label className="block text-left font-bold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                disabled={!isEditing}
                onChange={handleInputChange}
                className={`w-full p-3 rounded ${
                  isEditing ? "bg-gray-100" : "bg-gray-200"
                }`}
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-left font-bold mb-2">Email</label>
              <input
                type="email"
                value={userData.email}
                disabled
                className="w-full p-3 bg-gray-300 text-gray-500 rounded"
                placeholder="Your Email"
              />
            </div>
            {isEditing && (
              <div>
                <label className="block text-left font-bold mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded"
                  placeholder="New Password"
                />
              </div>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition duration-200"
              >
                Edit Profile
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold transition duration-200"
              >
                Save Changes
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}