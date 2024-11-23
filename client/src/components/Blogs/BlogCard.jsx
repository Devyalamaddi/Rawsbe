import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify"
import { UserContextObj } from "../../context/UserContext";

export default function BlogCard({ blog,refreshBlogs }) {
  const [userName, setUserName] = useState("");
  const {isAdmin} = useContext(UserContextObj);
  
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

  const handleDeleteBlog= async (blogId)=>{
    // console.log(blogId);
    try{
      const res = await axios.delete(`http://localhost:1234/user-api/delete-blog/${blogId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
        );
      if (res.data.message==="Blog deleted successfully"){
        toast.success("Blog Deleted Successfully");
        refreshBlogs();
      }else{
        toast.error("Error Deleting Blog");
      }
    }catch(err){
      console.log("Error while deleting a flagged blog in admin dashborad:", err.message);
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

      <p>
        {
          blog.STATUS==='F' ? <span className="text-red-500">This Blog is Flagged</span> :(<></>)
        }
      </p>

      <div className="flex justify-between w-full">
        <Link
          to={
            token===null ? '/login' : `/blogs/${blog.BLOGID}`
          }
          onClick={checkLoginStatus}
          className="mt-4 inline-block text-blue-800 hover:underline"
        >
          Read More
        </Link>
        {
          (isAdmin && blog.STATUS==='F') && <button 
          className=" rounded-md outline-2 border-solid transition-colors duration-700 ease-in-out border-red-800 text-red-700 hover:text-black hover:bg-red-600 px-4"
          onClick={()=>handleDeleteBlog(blog.BLOGID)}
          >
            Delete
          </button>
        }
      </div>
    </div>
  );
}
