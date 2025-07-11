import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Search.css';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [loading, setLoading] = useState(false);

    const username = localStorage.getItem('username'); // Retrieve username from local storage

    const GENRES_URL = 'https://api.example.com/genres'; // Replace with your genres API URL
    const SEARCH_URL = 'https://www.googleapis.com/books/v1/volumes?q=';

    useEffect(() => {
        axios.get(GENRES_URL)
            .then(res => setGenres(res.data))
            .catch(error => console.error("Error fetching genres:", error));

        fetchBooks(''); // Fetch default 20 books
    }, []);

    const fetchBooks = async (query) => {
        setLoading(true);
        try {
            const res = await axios.get(`${SEARCH_URL}${query}&maxResults=20`);
            setSearchResults(res.data.items || []);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        if (!username) {
            alert("User not logged in");
            return;
        }

        if (searchQuery.trim() !== '') {
            fetchBooks(searchQuery);
        }
    };

    const filteredResults = selectedGenre
        ? searchResults.filter(book => book.volumeInfo.categories?.includes(selectedGenre))
        : searchResults;

    return (
        <div className="search-page-container">
            <h1>Search for Books</h1>
            <form onSubmit={handleSearchSubmit} className="search-form-container">
                <input
                    type="text"
                    placeholder="Search for a book..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input-field"
                />
                <button type="submit" className="search-button-submit">Search</button>
            </form>
            <div className="genre-filter-container">
                <label htmlFor="genres">Filter by Genre:</label>
                <select
                    id="genres"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="genre-select-dropdown"
                >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>

            {loading && <p>Loading...</p>}

            <div className="search-results-container">
                {filteredResults.length > 0 ? (
                    filteredResults.map((item) => (
                        <div key={item.id} className="book-item-card">
                            <img src={item.volumeInfo?.imageLinks?.thumbnail} alt="Book cover" className="book-image-thumbnail" />
                            <div className="book-info-text">
                                <h3>
                                    <Link to={`/book/${item.id}/${encodeURIComponent(item.volumeInfo?.title)}`} className="book-title-text">
                                        {item.volumeInfo?.title}
                                    </Link>
                                </h3>
                                <p>by {item.volumeInfo?.authors?.join(', ')}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
};

export default Search;
