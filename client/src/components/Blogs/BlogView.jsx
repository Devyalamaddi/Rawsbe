import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function BlogView() {
  const { BLOGID } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:1234/user-api/blogs/${BLOGID}`
        );
        setBlog(data.payload[0]);

        
        const comments = await axios.get(` http://localhost:1234/user-api/comments/${BLOGID}`);
        // console.log(comments)
        setComments(comments.data.payload || []);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchBlog();
  }, [BLOGID,comments]);

  const token = localStorage.getItem("token");
  const handleAddComment = async () => {
    if(!token){
      alert("Please login to add a comment");
      navigate("/login")
    }
    
    try {
      
      const data = await axios.post(
        `http://localhost:1234/user-api/comment/${BLOGID}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, { text: newComment, id: data.commentId }]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  const userId=payload.userId;

  const handleDeleteComment = async (commentId) => {
    try {
      const data = await axios.delete(`http://localhost:1234/user-api/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

    }catch(err){
      console.error("error while deleteing comment",err.message);
    }
  }

  return blog ? (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
  <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.TITLE}</h1>
  <p className="text-sm text-gray-500 mb-6">
    Blog ID: {blog.BLOGID} | Posted on: {new Date(blog.DATEPOSTED).toDateString()}
  </p>
  <p className="mb-6 text-gray-700 leading-relaxed">{blog.CONTENT}</p>
  <div className="border-t border-gray-200 pt-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <div
          key={index}
          className="bg-gray-100 text-gray-800 p-4 rounded-lg shadow-sm"
        >
          <p className="text-sm font-medium text-gray-600">
            by: {comment.USERID}
          </p>
          <hr className="my-2" />
          <p className="text-gray-700">{comment.CONTENT}</p>
          {
            comment.USERID===userId ?(<button className="bg-red-700/80 text-white" onClick={()=>handleDeleteComment(comment.COMMENTID)}>Delete</button>):(<></>)
          }
        </div>

      ))}
    </div>
    <div className="mt-6">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        placeholder="Write a comment..."
      ></textarea>
      <button
        onClick={handleAddComment}
        className="bg-black text-white px-4 py-2 mt-3 rounded-lg hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
      >
        Add Comment
      </button>
    </div>
  </div>
</div>

  ) : (
    <p>Loading blog...</p>
  );
}
