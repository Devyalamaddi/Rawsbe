import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import axios from "axios";

export default function MovieList() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:1234/user-api/movies");
      // Sort movies by year in descending order
      const sortedMovies = (response.data.payload || []).sort(
        (a, b) => a.YEAR - b.YEAR
      );

      setMovies(sortedMovies);

    } catch (err) {
      console.log("Error while fetching movies", err.message);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...movies].reverse().map((movie) => (
          <MovieCard key={movie.MOVIEID} movie={movie} />
        ))}
      </div>
    </div>
  );
}
