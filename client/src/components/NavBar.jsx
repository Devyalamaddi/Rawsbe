import { useContext, useEffect } from "react";
import { UserContextObj } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const { loginStatus, currentUser, logout,isAdmin } = useContext(UserContextObj);
  let localLoginStatus=loginStatus;
  const navigate = useNavigate()
  useEffect(()=>{
    if(loginStatus){
      // console.log("logged in");
    }else{
      // console.log("logged out");
      localLoginStatus=false
    }
  },[loginStatus])
// console.log(currentUser)
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        <Link to="/">
          Movie Blog
        </Link>
      </h1>
      <div className="flex items-center space-x-4">
        {localLoginStatus ? (
          <>
            {
              isAdmin?( <Link to='/new-movie'>Add new movie</Link>):(<></>)
            }
            <Link to='/'>Home</Link>
            <Link to='/dashboard'>Dashboard</Link>
            <span>Welcome, <span className="text-xl text-green-700">{currentUser?.name || "User"}</span>!</span>
            <button
              onClick={()=>{logout(); navigate("/")}}
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
    </nav>
  );
}

export default NavBar;
