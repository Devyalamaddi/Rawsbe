import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast"

export default function NewBlog() {
  const { movieID } = useParams();
  const [blogTitle, setTitle] = useState("");
  const [blogContent, setContent] = useState("");
  const [firstHalfReview, setFirstHalfReview] = useState("");
  const [secondHalfReview, setSecondHalfReview] = useState("");
  const [firstHalfRating, setFirstHalfRating] = useState(5); // Default rating value
  const [secondHalfRating, setSecondHalfRating] = useState(5); // Default rating value
  const [overallRating, setOverallRating] = useState(5); // Default rating value
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let res =await axios.post(
        "http://localhost:1234/user-api/new-blog",
        {
          movieId: movieID,
          blogTitle,
          blogContent,
          firstHalfReview,
          secondHalfReview,
          firstHalfRating,
          secondHalfRating,
          overallRating,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if(res.data.message==="Blog posted successfully!"){
        toast.success("Blog created successfully!");
        navigate("/blogs");
      }else{
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err.message);
      setError("Failed to create blog.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Blog</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Blog Title */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            value={blogTitle}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* First Half Review */}
        <div>
          <label className="block font-medium mb-1">First Half Review</label>
          <textarea
            value={firstHalfReview}
            onChange={(e) => setFirstHalfReview(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Write your thoughts about the first half..."
            required
          ></textarea>
          <label className="block font-medium mt-2">
            First Half Rating (0-10): <span>{firstHalfRating}</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={firstHalfRating}
            onChange={(e) => setFirstHalfRating(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Second Half Review */}
        <div>
          <label className="block font-medium mb-1">Second Half Review</label>
          <textarea
            value={secondHalfReview}
            onChange={(e) => setSecondHalfReview(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Write your thoughts about the second half..."
            required
          ></textarea>
          <label className="block font-medium mt-2">
            Second Half Rating (0-10): <span>{secondHalfRating}</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={secondHalfRating}
            onChange={(e) => setSecondHalfRating(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Blog Content */}
        <div>
          <label className="block font-medium mb-1">Content</label>
          <textarea
            value={blogContent}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows="6"
            placeholder="Write your overall blog content..."
            required
          ></textarea>
        </div>

        {/* Overall Rating */}
        <div>
          <label className="block font-medium mt-2">
            Overall Rating (0-10): <span>{overallRating}</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={overallRating}
            onChange={(e) => setOverallRating(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-green-500 py-2 rounded text-white font-semibold">
          Submit
        </button>
      </form>
    </div>
  );
}
