// profile.js
import React, { useState, useEffect } from 'react';
import './profile.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    occupation: '',
    genres: []
  });

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      fetch(`http://localhost:5000/api/users/profile?username=${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          setUserData(data);
          setFormData({
            name: data.name,
            email: data.email,
            dob: data.dob ? data.dob.split('T')[0] : '',
            occupation: data.occupation,
            genres: data.genres || []
          });
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, []);

  const handleEditClick = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setEditMode(true);
      setFadeClass('fade-in');
    }, 500); // Match the duration of the fade-out animation
  };

  const handleSaveClick = () => {
    fetch(`http://localhost:5000/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: localStorage.getItem('username'), ...formData })
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setUserData(data);
        setFadeClass('fade-out');
        setTimeout(() => {
          setEditMode(false);
          setFadeClass('fade-in');
        }, 500);
      })
      .catch(error => console.error('Error updating user data:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!userData) return <p className="profile-loading">Loading...</p>;

  return (
    <div className={`profile-container ${fadeClass}`}>
      <h2 className="profile-header">Profile</h2>
      {editMode ? (
        <>
          <div className="profile-field">
            <label className="profile-label">
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="profile-input"
              />
            </label>
          </div>
          <div className="profile-field">
            <label className="profile-label">
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="profile-input"
                disabled
              />
            </label>
          </div>
          <div className="profile-field">
            <label className="profile-label">
              Date of Birth:
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="profile-input"
              />
            </label>
          </div>
          <div className="profile-field">
            <label className="profile-label">
              Occupation:
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="profile-input"
              />
            </label>
          </div>
          <div className="profile-field">
            <label className="profile-label">
              Genres:
              <input
                type="text"
                name="genres"
                value={formData.genres.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value.split(',').map(g => g.trim()) }))}
                className="profile-input"
              />
            </label>
          </div>
          <button onClick={handleSaveClick} className="profile-button-save">Save</button>
          <button onClick={() => setEditMode(false)} className="profile-button-cancel">Cancel</button>
        </>
      ) : (
        <>
          <p className="profile-info"><strong>Name:</strong> {userData.name}</p>
          <p className="profile-info"><strong>Email:</strong> {userData.email}</p>
          <p className="profile-info"><strong>Date of Birth:</strong> {userData.dob ? new Date(userData.dob).toLocaleDateString() : 'N/A'}</p>
          <p className="profile-info"><strong>Occupation:</strong> {userData.occupation}</p>
          <p className="profile-info"><strong>Genres:</strong> {userData.genres.join(', ')}</p>
          <button onClick={handleEditClick} className="profile-button-edit">Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default Profile;
