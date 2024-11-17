export default function AdminPanel() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="space-y-4">
        <button className="w-full bg-secondary text-white py-2 rounded">
          Manage Movies
        </button>
        <button className="w-full bg-secondary text-white py-2 rounded">
          Manage Genres
        </button>
        <button className="w-full bg-secondary text-white py-2 rounded">
          Manage Users
        </button>
      </div>
    </div>
  );
}
