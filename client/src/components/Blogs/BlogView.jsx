import { useState, useEffect, useContext } from "react";
import {  useParams } from "react-router-dom";
import axios from "axios";
import { MdDeleteOutline,MdThumbDown, MdThumbUp } from "react-icons/md";
import { UserContextObj } from "../../context/UserContext";
import {toast} from "react-toastify";

export default function BlogView() {
  const { BLOGID } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [users, setUsers] = useState({});
  const [userName, setUserName] = useState("");
  const {isAdmin} = useContext(UserContextObj);


  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`http://localhost:1234/user-api/blogs/${BLOGID}`);
        setBlog(data.payload[0]);

        const comments = await axios.get(`http://localhost:1234/user-api/comments/${BLOGID}`);
        setComments(comments.data.payload || []);
        
        // Fetch users data in parallel to improve performance
        const userPromises = comments.data.payload.map(async (comment) => {
          const userRes = await axios.get(`http://localhost:1234/user-api/user/${comment.USERID}`);
          return { userId: comment.USERID, userName: userRes.data.payload[0] }; // Assuming 'name' is the user's name
        });

        const usersData = await Promise.all(userPromises);

        // Store user names by userId
        const usersMap = {};
        usersData.forEach(({ userId, userName }) => {
          usersMap[userId] = userName;
        });

        setUsers(usersMap); // Store the users map

      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchBlog();
  }, [BLOGID]);

  
  useEffect(() => {
    const fetchUserName = async () => {
      if(blog && blog.USERID){
        try {
          const response = await axios.get(`http://localhost:1234/user-api/user/${blog.USERID}`);
          setUserName(response.data.payload[0]); 
        } catch (error) {
          console.error("Error fetching user name:", error);
        }
      }
    };

    fetchUserName();
  }, [blog]); 

  const token = localStorage.getItem("token");

  const handleAddComment = async () => {
    if(newComment===""){
      toast.warning("Please enter a comment");
    }
    else{
      try {
        const data = await axios.post(
          `http://localhost:1234/user-api/comment/${BLOGID}`,
          { content: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComments([...comments, { CONTENT: newComment, COMMENTID: data.commentId }]);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  const userId = payload.userId;

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:1234/user-api/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.filter(comment => comment.COMMENTID !== commentId));
    } catch (err) {
      console.error("Error while deleting comment", err.message);
    }
  };

  const [upVotes, setUpVotes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`http://localhost:1234/user-api/blogs/${BLOGID}`);
        setBlog(data.payload[0]);

        const commentsRes = await axios.get(`http://localhost:1234/user-api/comments/${BLOGID}`);
        setComments(commentsRes.data.payload || []);

        // Fetch users data in parallel
        const userPromises = commentsRes.data.payload.map(async (comment) => {
          const userRes = await axios.get(`http://localhost:1234/user-api/user/${comment.USERID}`);
          return { userId: comment.USERID, userName: userRes.data.payload[0] };
        });

        const usersData = await Promise.all(userPromises);
        const usersMap = {};
        usersData.forEach(({ userId, userName }) => (usersMap[userId] = userName));
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    const fetchVotes = async () => {
      try {
        const res = await axios.get(`http://localhost:1234/user-api/vote/${BLOGID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        // Assuming the response contains upVotes and downVotes
        if (res.data[0] !== undefined && res.data[1] !== undefined) {
          setUpVotes(res.data[0]);
          setDownVotes(res.data[1]);
        } else {
          console.error("Unexpected response format:", res.data);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };
    

    fetchBlog();
    fetchVotes();
  }, [BLOGID, token]);

  const handleVote = async (voteType) => {
    // console.log("Attempting to vote:", { voteType, userId: userId, blogId: BLOGID });
    try {
        const res = await axios.post(
            `http://localhost:1234/user-api/vote`,
            { voteType, userId: userId, blogId: BLOGID },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // console.log("Server response:", res.data);
        if (res.data.message === "Vote Casted") {
            toast.success("Voted successfully!");
            if (voteType === "U") setUpVotes(upVotes + 1);
            else setDownVotes(downVotes + 1);
        }
    } catch (err) {
        if (err.response && err.response.status === 400) {
            const serverMessage = err.response.data.message;
            if (serverMessage === "User has already voted") {
                toast.warning("You have already voted for this blog.");
            } else {
                toast.error(serverMessage || "An error occurred while voting.");
            }
        } else {
            toast.error("Unexpected error occurred. Please try again.");
        }
        console.log("Error while handling vote:", err.message);
    }
};


  return blog ? (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.TITLE}</h1>
      <div className="flex gap-3 items-center">
        <p className="text-sm text-gray-500">Blog ID: {blog.BLOGID}</p>
        <p className="text-sm text-gray-500">Posted on: {new Date(blog.DATEPOSTED).toDateString()}</p>
        <p className="text-sm text-gray-500">By: {userName || "Loading..."}</p>
      </div>

      {/* First Half Review */}
      <div className="flex gap-10 justify-start w-full items-center">
        <h5 className="font-semibold">First Half review</h5>
        <p className="text-yellow-500 font-extrabold">{blog.FIRSTHALFRATING}/10</p>
      </div>
      <p className="mb-6 text-gray-700 leading-relaxed">{blog.FIRSTHALFREVIEW}</p>

      {/* Second Half Review */}
      <div className="flex gap-10 justify-start w-full items-center">
        <h5 className="font-semibold">Second Half review</h5>
        <p className="text-yellow-500 font-extrabold">{blog.SECONDHALFRATING}/10</p>
      </div>
      <p className="mb-6 text-gray-700 leading-relaxed">{blog.SECONDHALFREVIEW}</p>

      {/* Overall Review */}
      <div className="flex gap-10 justify-start w-full items-center">
        <h5 className="font-semibold">OVERALL review</h5>
        <p className="text-yellow-500 font-extrabold">{blog.OVERALLRATING}/10</p>
      </div>
      <p className="mb-6 text-gray-700 leading-relaxed">{blog.CONTENT}</p>

      {/* Voting Section */}
      <div className="flex items-center gap-4 my-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote('U')}
            className={`flex items-center gap-1 px-3 py-1 rounded ${
               'bg-green-100 hover:bg-green-200'
            } ${isAdmin ? "hover:cursor-not-allowed":""}`}
            disabled={isAdmin}
          >
            <MdThumbUp />
            <span>{upVotes}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote('D')}
            className={`flex items-center gap-1 px-3 py-1 rounded ${
               'bg-red-100 hover:bg-red-200'
            } ${isAdmin ? "hover:cursor-not-allowed":""}` }
            disabled={isAdmin}
          >
            <MdThumbDown />
            <span>{downVotes}</span>
          </button>
        </div>
        {blog.STATUS === 'F' && (
          <div className="text-red-500 font-semibold ml-4">
            This blog has been flagged
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="bg-gray-100 text-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between itmes-centerw-full">
                <p className="text-sm font-medium text-gray-600">
                  by: {comment.USERID === userId ? "You" : users[comment.USERID] || "Loading..."}
                </p>
                {(isAdmin || comment.USERID === userId)  && (
                  <button className="bg-red-500/60 px-4 py-2 rounded text-white ease-in-out transition-colors duration-300 hover:bg-black hover:text-red-600/90" onClick={() => handleDeleteComment(comment.COMMENTID)}>
                    <MdDeleteOutline className="size-4"/>
                  </button>
                )}
              </div>
              <hr className="my-2" />
              <p className="text-gray-700">{comment.CONTENT}</p>
              
            </div>
          ))}
        </div>

        {
          !isAdmin && (
              <div className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Write a comment..."
              ></textarea>
              <button
                onClick={handleAddComment}
                className="bg-black text-white px-4 py-2 mt-3 rounded-lg ease-in-out transition-colors duration-300 hover:text-white hover:bg-green-700 focus:outline-none focus:ring-2"
              >
                Add Comment
              </button>
            </div>
          )
        }
      </div>
    </div>
  ) : (
    <p>Loading blog...</p>
  );
}
