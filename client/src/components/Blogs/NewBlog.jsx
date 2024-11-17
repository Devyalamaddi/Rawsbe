import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function NewBlog() {
  const {movieID} = useParams();
  const [blogTitle, setTitle] = useState("");
  const [blogContent, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const movieId=movieID;
      await axios.post(
        "http://localhost:1234/user-api/new-blog",
        { movieId,blogTitle, blogContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Blog created successfully!");
      navigate('/blogs')
    } catch (err) {
      console.log(err.message)
      setError("Failed to create blog.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Blog</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Title</label>
          <input
            type="text"
            value={blogTitle}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label>Content</label>
          <textarea
            value={blogContent}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows="10"
            required
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-green-500 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
