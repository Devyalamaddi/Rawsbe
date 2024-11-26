import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContextObj = createContext();

function UserContext({ children }) {
  const [loginStatus, setLoginStatus] = useState(false); // Tracks if the user is logged in
  const [currentUser, setCurrentUser] = useState(null); // Stores logged-in user's data
  const [error, setError] = useState(null); // Stores error messages for better UI feedback
  const [isAdmin, setIsAdmin] = useState();

  // Updated useEffect in UserContext
useEffect(() => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("currentUser");

  if (token && user) {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));

    setCurrentUser(JSON.parse(user)); // Restore user state
    setLoginStatus(true);
    setIsAdmin(payload.role === "admin"); // Restore admin state
  } else {
    setLoginStatus(false);
    setIsAdmin(false); // Ensure isAdmin is false when not logged in
  }
}, []);


  // Login function
  async function login(userObj) {
    try {
      const response = await axios.post("http://localhost:1234/user-api/login", userObj);
      console.log(response,"from usercontext login function")
      if (response.data.message==="User logged in" || response.data.message==="logged in as Admin") {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("currentUser", JSON.stringify(user)); // Save user details
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        if (payload.role === "admin") setIsAdmin(true);
        setCurrentUser(user); // Update state
        setLoginStatus(true);
        setError(null); // Clear any previous errors
        return "Login successful!";
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Failed to log in.");
      setLoginStatus(false);
      return err.message;
    }
  }

  // Register function
  async function register(userObj) {
    try {
      const response = await axios.post("http://localhost:1234/user-api/registration", userObj);
      if (response.status === 201) {
        setError(null); // Clear errors on successful registration
        return "Registration successful!";
      } else {
        throw new Error("Registration failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to register.");
      return err.message;
    }
  }

  // Logout function
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setLoginStatus(false);
    setError(null);
  }

  // Load user data from localStorage on initial render
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("currentUser");
    if (token && user) {
      setCurrentUser(JSON.parse(user)); // Restore user state
      setLoginStatus(true);
    } else {
      setLoginStatus(false);
    }
  }, []);

  return (
    <UserContextObj.Provider
      value={{
        login,
        register,
        logout,
        loginStatus,
        currentUser,
        setCurrentUser,
        error,
        setError,
        isAdmin,
      }}
    >
      {children}
    </UserContextObj.Provider>
  );
}

export default UserContext;
