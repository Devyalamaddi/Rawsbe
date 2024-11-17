import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  return (
    <div className=" shadow-md rounded p-4 hover:shadow-lg transition">
      <h3 className="text-xl font-bold mb-2">{blog.TITLE}</h3>
      <p className="text-secondary mb-4">{blog.USERID}</p>
      <div className="text-sm text-gray-500">
        <p>By: {}</p>
        <p>Published: {new Date(blog.DATEPOSTED).toLocaleDateString()}</p>
      </div>
      <Link
        to={`/blogs/${blog.BLOGID}`}
        className="mt-4 inline-block text-blue-800 hover:underline"
      >
        Read More
      </Link>
    </div>
  );
}
