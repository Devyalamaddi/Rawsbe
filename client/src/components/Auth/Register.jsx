import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [username, setUsername] = useState(""); // Corresponds to 'name' in the backend
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    try {
      const response = await axios.post("http://localhost:1234/user-api/registration", {
        name: username,
        email,
        password,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Registration successful! Please log in.", {
          // position: "top-right", // Use string for the position
          autoClose: 3000,
        });
      }
      setTimeout(() => {
        navigate("/login")
      }, 1000);
    } catch (err) {
      setError("Registration failed. Please try again.");
      toast.error("Registration failed. Please try again.", {
        // position: "top-right", // Use string for the position
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="w-full bg-black text-white py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
