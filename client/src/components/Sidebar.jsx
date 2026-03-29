import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ links }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-brandOrange text-white p-4 flex flex-col">
      <h1 className="text-lg font-semibold mb-6">College DMS</h1>
      <p className="text-sm mb-6">{user?.name} ({user?.role})</p>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="block px-3 py-2 rounded hover:bg-orange-600">
            {link.label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="mt-6 bg-white text-brandOrange px-3 py-2 rounded font-semibold">
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
