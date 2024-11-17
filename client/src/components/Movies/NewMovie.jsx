import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NewMovie() {
  const [movieName, setmovieName] = useState("");
  const [year, setYear] = useState("");
  const [genres, setGenres] = useState("");
  const [rating, setRating] = useState(0);
  const [director, setDirector] = useState("");
  const [posterURL, setPosterUrl] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:1234/user-api/new-movie",
        {
          movieName,
          year,
          genres,
          rating,
          director,
          posterURL,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Movie added successfully!");
      // Reset form fields
      setmovieName("");
      setYear("");
      setGenres("");
      setRating(0);
      setDirector("");
      setPosterUrl("");
      navigate("/movies");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add movie.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Movie</h2>
      {message && <p className={message.includes("success") ? "text-green-500" : "text-red-500"}>{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Movie Name</label>
          <input
            type="text"
            value={movieName}
            onChange={(e) => setmovieName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label>Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label>Genres (comma-separated)</label>
          <input
            type="text"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., Action, Adventure"
            required
          />
        </div>
        <div>
          <label>Director</label>
          <input
            type="text"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label>Rating</label>
          <input
            type="range"
            name="rating"
            value={rating}
            min="0"
            max="10"
            step="0.1"
            onChange={(e) => setRating(e.target.value)}
            className="w-full"
          />
          <span>{rating}</span>
        </div>
        <div>
          <label>Poster URL</label>
          <input
            type="url"
            value={posterURL}
            onChange={(e) => setPosterUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., https://example.com/poster.jpg"
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">
          Add Movie
        </button>
      </form>
    </div>
  );
}
