import { useEffect, useState } from "react";
import { Link } from "react-router-dom";



export default function MovieCard({ movie }) {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogin(!!token);
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-all relative">
      <div className="h-72 w-full relative overflow-hidden rounded-t-lg">
        <img
          src={movie.POSTERURL}
          alt={movie.MOVIENAME}
          className="object-fit w-full"
        />
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-transparent to-transparent h-20">
          <h3 className="text-lg text-white font-bold absolute bottom-2 left-4">
            {movie.MOVIENAME}
          </h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-700 mb-2">Genre: {movie.GENRES}</p>
        <div className="text-sm text-gray-500">
          <p>Director: {movie.DIRECTOR}</p>
          <p>Released: {movie.YEAR}</p>
        </div>
        <div className="mt-4">
          {isLogin ? (
            <Link
              to={`/new-blog/${movie.MOVIEID.replace(/^:/, "")}`}
              className="text-blue-500 hover:underline"
            >
              Write a blog
            </Link>
          ) : (
            <Link to="/login" className="text-blue-500 hover:underline">
              Login to write a blog
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
