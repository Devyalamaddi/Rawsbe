import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify"

export default function BlogCard({ blog }) {
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(`http://localhost:1234/user-api/user/${blog.USERID}`);
        setUserName(response.data.payload[0]); 
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, [blog.USERID]); 
  const token = localStorage.getItem("token");

  //to alert about the login Status
  const checkLoginStatus = () => {
    if (!token) {
      toast.warning("Please Login to read the Review");
    }
  }
  

  return (
    <div className="shadow-md rounded p-4 hover:shadow-lg transition">
      <h3 className="text-xl font-bold mb-2">{blog.TITLE}</h3>
      <div className="flex justify-between w-full">
        <div className="text-sm text-gray-500">
          <p>By: {userName || "Loading..."}</p>
          <p>Published: {new Date(blog.DATEPOSTED).toLocaleDateString()}</p>
        </div>
        <p className="text-sm text-gray-500">Rating: <span className="bold text-yellow-500">{blog.OVERALLRATING}/10</span></p>
      </div>

      <Link
        to={
          token===null ? '/login' : `/blogs/${blog.BLOGID}`
        }
        onClick={checkLoginStatus}
        className="mt-4 inline-block text-blue-800 hover:underline"
      >
        Read More
      </Link>
    </div>
  );
}
