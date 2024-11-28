import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./MovieCard.css"; // Import the custom CSS for the 3D effect

export default function MovieCard({ movie }) {
  const [isLogin, setIsLogin] = useState(true);
  const [blogCount, setBlogCount] = useState(0);

  const fetchBlogCount = async () => {
    const response = await axios.get(`http://localhost:1234/user-api/blogcount/${movie.MOVIEID}`);
    setBlogCount(response.data.payload);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogin(!!token);
    fetchBlogCount();
  }, []);

  return (
    <div className="card relative group bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-all">
      {/* Movie Poster Section */}
      <div className="wrapper h-72 w-full relative overflow-hidden rounded-t-lg">
        <div className="pseudo-elements"></div>

        <img
          src={movie.POSTERURL}
          alt={movie.MOVIENAME}
          className="object-cover w-full h-full transition-transform duration-500"
        />
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-transparent to-transparent h-20">
          <h3 className="title text-lg text-white font-bold absolute bottom-2 left-4 transition-all duration-300">
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
