import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white min-h-screen flex flex-col">
      

      {/* Hero Content */}
      <section className="flex-grow flex items-center justify-center text-center">
        <div className="space-y-6 max-w-2xl px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Discover, Write, and Share Your <span className="text-yellow-300">Love for Movies</span>
          </h2>
          <p className="text-lg text-gray-200">
            A platform for movie enthusiasts to explore new films, write engaging blogs, and connect with like-minded fans.
          </p>
          <div className="space-x-4 flex flex-wrap justify-center">
            <Link
              to="/blogs"
              className="px-6 py-3 bg-yellow-300 text-indigo-800 font-bold rounded-lg hover:bg-yellow-400 transition duration-200"
            >
              Explore Blogs
            </Link>
            <Link
              to="/movies"
              className="px-6 py-3 bg-indigo-500 font-bold rounded-lg hover:bg-indigo-400 transition duration-200"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <h3 className="text-3xl font-bold text-center">Why Choose Movie Blog?</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon="✍️"
              title="Write Your Thoughts"
              description="Share your movie experiences by writing blogs and reviews."
            />
            <Feature
              icon="🔍"
              title="Explore New Movies"
              description="Discover trending and classic movies across various genres."
            />
            <Feature
              icon="💬"
              title="Engage with Community"
              description="Comment and interact with other movie lovers on their blogs."
            />
          </div>
        </div>
      </section>

      
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md text-center hover:shadow-lg transition duration-200">
      <div className="text-4xl">{icon}</div>
      <h4 className="text-xl font-bold mt-4">{title}</h4>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}
