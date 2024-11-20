import { useContext, useState } from "react";
import { UserContextObj } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const { loginStatus, currentUser, logout, isAdmin } = useContext(UserContextObj);
  const [menuOpen, setMenuOpen] = useState(false); // State to toggle the mobile menu
  const navigate = useNavigate();

  function capitalizeFirstLetter(name) {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/">Movie Blog</Link>
        </h1>

        {/* Hamburger Menu for Mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h14M4 18h12"}
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            menuOpen ? "block flex flex-col" : "hidden"
          } md:flex md:items-center space-y-3 md:space-y-0 md:space-x-4`}
        >
          {loginStatus ? (
            <>
              {isAdmin && <Link to="/new-movie">Add New Movie</Link>}
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
              <span className="text-xl">
                Welcome,{" "}
                <span className=" font-extrabold text-green-700">
                  {currentUser?.name ? capitalizeFirstLetter(currentUser.name) : "User"}
                </span>
                !
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
