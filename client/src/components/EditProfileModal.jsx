import React, { useContext, useState } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContextObj } from '../context/UserContext';

export default function EditProfileModal({ payload, token, onProfileUpdate }) {
  const [name, setName] = useState(payload?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const {setCurrentUser} = useContext(UserContextObj);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:1234/user-api/edituser/${payload.userId}`, 
        { 
          name, 
          password 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Handle successful update
      if (response.data.message === "User updated") {
        onProfileUpdate(); // Trigger any necessary refresh
        setIsOpen(false); // Close modal
        setPassword(''); // Clear password fields
        setConfirmPassword('');
        // console.log(response.data, name, password)
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // console.log(currentUser);
        currentUser.name = name;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        setCurrentUser(currentUser)

      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
      console.error('Profile update error:', err);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-outline-secondary flex items-center gap-2"
      >
        <FaPencilAlt /> Edit Profile
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-600 hover:text-gray-900"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input 
                  type="text"
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password (optional)
                </label>
                <input 
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank if no password change"
                />
              </div>

              {password && (
                <div className="form-group">
                  <label 
                    htmlFor="confirm-password" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <input 
                    type="password"
                    id="confirm-password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!!password}
                  />
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary w-full mt-4 flex items-center justify-center"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}