import { Outlet } from "react-router-dom";
import NavBar from "./NavBar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <NavBar/>
      <main className="flex-grow bg-gray-100 p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-gray-300 py-6 text-center">
        <p className="">© 2024 rawsBe. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="hover:text-white transition duration-200">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition duration-200">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
