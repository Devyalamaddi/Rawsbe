import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContextObj = createContext();


function UserContext({ children }) {
  const [loginStatus, setLoginStatus] = useState(); // Tracks if the user is logged in
  const [currentUser, setCurrentUser] = useState(null); // Stores logged-in user's data
  const [error, setError] = useState(null); // Stores error messages for better UI feedback
  const [isAdmin, setIsAdmin] = useState();
  let contextUser;
  

  // Login function
  async function login(userObj) {
    try {
      const response = await axios.post("http://localhost:1234/user-api/login", userObj);
      if (response.status === 200) {
        const { token,user } = response.data;
        localStorage.setItem("token", token);
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        if(payload.role==='admin') setIsAdmin(true);
        contextUser=user;
        setCurrentUser(user);
        setLoginStatus(true);
        setError(null);// Clear any previous errors
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
    setCurrentUser(null);
    setLoginStatus(false);
    setError(null);
    // navigate("/");
  }
  const token = localStorage.getItem("token");
  useEffect(()=>{

  if (token) {
    // setCurrentUser(JSON.parse(token));
    // setCurrentUser(contextUser)
    setLoginStatus(true);
    }else{
      setLoginStatus(false);
    }
    }, [])

  return (
    <UserContextObj.Provider
      value={{
        login,
        register,
        logout,
        loginStatus,
        currentUser,
        error,
        setError,
        isAdmin
      }}
    >
      {children}
    </UserContextObj.Provider>
  );
}

export default UserContext;
