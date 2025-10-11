import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaChartBar,
  FaUtensils 
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: isAdmin ? FaChartBar : FaUtensils,
      show: true
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: FaUser,
      show: true
    }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 text-xl font-bold text-primary-600"
          >
            <FaUtensils className="text-2xl" />
            <span>Hostel Food Analysis</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.filter(item => item.show).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200
                  ${isActivePath(item.path) 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="text-sm" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* User Menu */}
            <div className="flex items-center space-x-4 pl-4 border-l border-gray-300">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-500">
                  {user?.rollNumber} • {isAdmin ? 'Admin' : 'Student'}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FaSignOutAlt className="text-sm" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navItems.filter(item => item.show).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActivePath(item.path) 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="text-lg" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="px-4 py-3 border-t border-gray-200">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {user?.rollNumber} • {isAdmin ? 'Admin' : 'Student'}
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
