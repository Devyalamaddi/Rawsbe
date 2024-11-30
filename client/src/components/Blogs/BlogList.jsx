import { useEffect, useState } from "react";
import BlogCard from "./BlogCard";
import axios from 'axios';

export default function BlogList() {
  const [bloglist, setBlogList] = useState([]);

  const blogListFetchReq = async () => {
    try {
      const response = await axios.get('http://localhost:1234/user-api/blogs');
      console.log(response); // For debugging
      setBlogList(response.data.payload); // Access the payload property
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    blogListFetchReq();
  }, []); // Run only once on component mount

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...bloglist].reverse().map((blog) => (
        <BlogCard key={blog.BLOGID} blog={blog} />
      ))}
    </div>
  );
}
