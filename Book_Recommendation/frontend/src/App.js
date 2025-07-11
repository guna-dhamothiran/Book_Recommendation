import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/navabar';
import Login from './components/Login/login';
import Signup from './components/Signup/signup';
import Book from './components/Book/book';
import Search from './components/Search/search';
import BookDetails from './components/BookDetails/BookDetails';
import DiscussionPage from './components/DiscussionPage/discussionpage';
import Profile from './components/ProfilePage/profile';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if the user is logged in on component mount
    useEffect(() => {
        const username = localStorage.getItem('username');
        setIsLoggedIn(!!username); // Set logged-in status based on the presence of username
    }, []);

    return (
        <Router>
            {isLoggedIn && <Navbar />} {/* Display Navbar only if logged in */}
            <Routes>
                <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<Book />} />
                <Route path="/search" element={<Search />} />
                <Route path="/discussion" element={<DiscussionPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/book/:id/:title" element={<BookDetails />} />
            </Routes>
        </Router>
    );
}

export default App;