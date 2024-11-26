import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import BlogList from "./components/Blogs/BlogList";
import BlogView from "./components/Blogs/BlogView";
import NewBlog from "./components/Blogs/NewBlog";
import Dashboard from "./components/Dashboard/Dashboard";
import MovieList from "./components/Movies/MovieList";
import NewMovie from "./components/Movies/NewMovie";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path:"/", element:<LandingPage/>},
      { path: "/blogs", element: <BlogList /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/blogs/:BLOGID", element: <BlogView /> },
      { path: '/new-blog/:movieID', element: <ProtectedRoute component={<NewBlog />} /> },
      { path: "/movies", element: <MovieList /> },
      { path: "/new-movie", element: <ProtectedRoute component={<NewMovie />} /> },
      { path: "/dashboard", element: <ProtectedRoute component={<Dashboard />} /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
