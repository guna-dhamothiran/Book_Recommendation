import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './signup.css';

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    dob: '',
    occupation: '',
    genres: [],
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  const genresList = [
    "Fiction", "Science Fiction", "Fantasy", "Mystery", "Romance", "Horror",
    "Biography", "Autobiography", "Self-Help", "Travel", "History", "Science",
    "Graphic Novels", "Poetry", "Classic Literature", "Sports & Recreation"
  ];

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };
      const validationErrors = validate(updatedForm);
      setErrors(validationErrors);
      return updatedForm;
    });
  };

  // Genre selection handler
  const handleGenreSelection = (genre) => {
    setForm((prevForm) => {
      const updatedGenres = prevForm.genres.includes(genre)
        ? prevForm.genres.filter((g) => g !== genre)
        : [...prevForm.genres, genre];
      const updatedForm = { ...prevForm, genres: updatedGenres };
      const validationErrors = validate(updatedForm);
      setErrors(validationErrors);
      return updatedForm;
    });
  };

  // Validation function
  const validate = (updatedForm) => {
    const newErrors = {};
    if (!updatedForm.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (/[^a-zA-Z\s]/.test(updatedForm.name)) {
      newErrors.name = 'Name must not contain special characters';
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!updatedForm.email || !emailRegex.test(updatedForm.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!updatedForm.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (/[^a-zA-Z0-9_]/.test(updatedForm.username)) {
      newErrors.username = 'Username should only contain alphanumeric characters and underscores';
    }

    if (!updatedForm.dob) {
      newErrors.dob = 'Date of Birth is required';
    } else if (new Date(updatedForm.dob) > new Date()) {
      newErrors.dob = 'Date of Birth cannot be in the future';
    }

    if (!updatedForm.occupation) {
      newErrors.occupation = 'Occupation is required';
    }

    if (updatedForm.genres.length === 0) {
      newErrors.genres = 'Select at least one genre';
    }

    if (!updatedForm.password || updatedForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (/\s/.test(updatedForm.password)) {
      newErrors.password = 'Password cannot contain spaces';
    }

    if (updatedForm.password !== updatedForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setIsFormValid(Object.keys(newErrors).length === 0);
    return newErrors;
  };

  // Signup submission handler
  const handleSignup = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/signup', form);
      alert(res.data.message);
      navigate('/'); // Redirect to login page on successful signup
    } catch (error) {
      alert(error.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="logo-section">
        <div className="icon-android">📚</div>
        <h2>Signup</h2>
      </div>

      <div className="signup-col-right">
        <div className="signup-form-container">
          <input
            className="signup-input"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleInputChange}
          />
          {errors.name && <p className="login-error-message">{errors.name}</p>}

          <input
            className="signup-input"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleInputChange}
          />
          {errors.email && <p className="login-error-message">{errors.email}</p>}

          <input
            className="signup-input"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleInputChange}
          />
          {errors.username && <p className="login-error-message">{errors.username}</p>}

          <input
            className="signup-input"
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleInputChange}
          />
          {errors.dob && <p className="login-error-message">{errors.dob}</p>}

          <select
            className="signup-select"
            name="occupation"
            value={form.occupation}
            onChange={handleInputChange}
          >
            <option value="">Select Occupation</option>
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
          {errors.occupation && <p className="login-error-message">{errors.occupation}</p>}

          <h3>Select Your Favorite Genres</h3>
          <div className="signup-genre-list">
            {genresList.map((genre) => (
              <label key={genre} className="signup-genre-label">
                <input
                  type="checkbox"
                  checked={form.genres.includes(genre)}
                  onChange={() => handleGenreSelection(genre)}
                />
                {genre}
              </label>
            ))}
          </div>
          {errors.genres && <p className="login-error-message">{errors.genres}</p>}

          <input
            className="signup-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleInputChange}
          />
          {errors.password && <p className="login-error-message">{errors.password}</p>}

          <input
            className="signup-input"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleInputChange}
          />
          {errors.confirmPassword && <p className="login-error-message">{errors.confirmPassword}</p>}

          <button
            className="signup-btn"
            onClick={handleSignup}
            disabled={!isFormValid} // Disable the button if the form is invalid
          >
            Sign Up
          </button>

          <div className="signup-register-link">
            <p>Already a user? <Link to="/">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
