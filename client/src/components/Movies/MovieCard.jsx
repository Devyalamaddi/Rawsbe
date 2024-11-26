import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


export default function MovieCard({ movie }) {
  const [isLogin, setIsLogin] = useState(true);
  const [blogCount, setBlogCount] = useState(0);

  const fetchBlogCount = async() =>{
    console.log(movie)
    const response = await axios.get(`http://localhost:1234/user-api/blogcount/${movie.MOVIEID}`);
    // console.log(movie.MOVIEID);
    console.log(response.data.payload);
    setBlogCount(response.data.payload);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogin(!!token);
    fetchBlogCount();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-all relative group">
  {/* Movie Poster Section */}
  <div className="h-72 w-full relative overflow-hidden rounded-t-lg">
    <img
      src={movie.POSTERURL}
      alt={movie.MOVIENAME}
      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
    />
    {/* Gradient Overlay */}
    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-transparent to-transparent h-20">
      <h3 className="text-lg text-white font-bold absolute bottom-2 left-4 transition-all duration-300 group-hover:translate-y-[-5px]">
        {movie.MOVIENAME}
      </h3>
    </div>
  </div>

  {/* Movie Details Section */}
  <div className="p-4">
    <p className="text-gray-700 mb-2">Genre: {movie.GENRES}</p>
    <div className="text-sm text-gray-500">
      <p>Director: {movie.DIRECTOR}</p>
      <p>Released: {movie.YEAR}</p>
    </div>

    <p className="text-gray-700 mb-2">Number of Blogs: {blogCount}</p>

    {/* Write Blog Section */}
    <div className="mt-4">
      {isLogin ? (
        <Link
          to={`/new-blog/${movie.MOVIEID.replace(/^:/, "")}`}
          className="text-blue-500 hover:underline transition-all duration-300"
        >
          Write a blog
        </Link>
      ) : (
        <Link
          to="/login"
          className="text-blue-500 hover:underline transition-all duration-300"
        >
          Login to write a blog
        </Link>
      )}
    </div>
  </div>
</div>

  );
}
