import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Book.css';

class Book extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            recommendedBooks: {}, 
            userGenres: [],
            viewedBooks: [],
        };
    }

    USER_GENRES_URL = 'http://localhost:5000/api/users/genres';
    SEARCH_URL = 'https://www.googleapis.com/books/v1/volumes/';
    VIEWED_BOOKS_URL = 'http://localhost:5000/api/viewed-books';

    componentDidMount() {
        this.fetchUserGenres();
        this.fetchViewedBooks();
    }

    fetchUserGenres = () => {
        const username = localStorage.getItem('username');
        if (username) {
            axios.get(`${this.USER_GENRES_URL}?username=${username}`)
                .then(res => {
                    this.setState({ userGenres: res.data.genres }, this.fetchRecommendedBooks);
                })
                .catch(error => {
                    console.error('Error fetching user genres:', error);
                    this.setState({ isLoaded: true, error });
                });
        } else {
            console.error('No username found in localStorage');
            this.setState({ isLoaded: true, userGenres: [] });
        }
    };

    fetchViewedBooks = async () => {
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const response = await axios.get(`${this.VIEWED_BOOKS_URL}?username=${username}`);
                const viewedBooksData = response.data.viewedBooks;

                if (viewedBooksData.length > 0) {
                    const viewedBooksRequests = viewedBooksData.map(book =>
                        axios.get(`${this.SEARCH_URL}${book.bookId}`)
                            .then(res => ({
                                ...book,
                                details: res.data.volumeInfo,
                            }))
                            .catch(error => {
                                console.error(`Error fetching book details for bookId ${book.bookId}:`, error);
                                return null;
                            })
                    );

                    const viewedBooks = await Promise.all(viewedBooksRequests);
                    this.setState({
                        viewedBooks: viewedBooks.filter(book => book && book.details),
                        isLoaded: true,
                    });
                } else {
                    this.setState({ viewedBooks: [], isLoaded: true });
                }
            } catch (error) {
                console.error('Error fetching viewed books:', error);
                this.setState({ error, isLoaded: true });
            }
        } else {
            console.error('No username found in localStorage');
        }
    };

    fetchRecommendedBooks = () => {
        const { userGenres } = this.state;
        const requests = userGenres.map(genre => {
            const genreQuery = `subject:${genre}&maxResults=20`;
            return axios.get(`${this.SEARCH_URL}?q=${genreQuery}`);
        });

        Promise.all(requests)
            .then(responses => {
                const recommendedBooks = {};
                responses.forEach((response, index) => {
                    const genre = userGenres[index];
                    recommendedBooks[genre] = response.data.items || [];
                });
                this.setState({
                    isLoaded: true,
                    recommendedBooks,
                    error: null,
                });
            })
            .catch(error => {
                console.error('Error fetching recommended books:', error);
                this.setState({
                    isLoaded: true,
                    error,
                    recommendedBooks: {}
                });
            });
    };

    handleBookClick = (id, title) => {
        const username = localStorage.getItem('username');
        if (username) {
            localStorage.setItem('selectedBookId', id);
            localStorage.setItem('selectedBookTitle', title);

            axios.post('http://localhost:5000/api/log-viewed-book', {
                username,
                bookId: id,
                bookTitle: title
            })
            .then(response => {
                console.log(response.data.message);
                this.fetchViewedBooks();
            })
            .catch(error => {
                console.error("Error logging viewed book:", error);
            });
        } else {
            console.error("Username not found in localStorage");
        }
    };

    render() {
        const { error, isLoaded, recommendedBooks, userGenres, viewedBooks } = this.state;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="book-wrapper">
                    <div className="recently-read-section">
                        <h2>Books You’ve Read</h2>
                        <div className="book-list-recent">
                            {viewedBooks.length > 0 ? (
                                viewedBooks.map(book => (
                                    <div key={book.bookId} className="book-card-recent">
                                        <img src={book.details.imageLinks?.thumbnail} alt="Book cover" />
                                        <h4>{book.details.title}</h4>
                                        <p>by {book.details.authors?.join(', ')}</p>
                                        <p>Read {book.viewCount} times</p>
                                        <Link 
                                            to={`/book/${book.bookId}/${encodeURIComponent(book.details.title)}`} 
                                            className="button-view-details"
                                            onClick={() => this.handleBookClick(book.bookId, book.details.title)}
                                        >
                                            Continue Reading
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>No previously read books found.</p>
                            )}
                        </div>
                    </div>

                    <div className="genre-preferences-section">
                        <h2>Your Favorite Genres</h2>
                        <ul className="genre-list">
                            {userGenres.length > 0 ? (
                                userGenres.map((genre, index) => (
                                    <li key={index}>{genre}</li>
                                ))
                            ) : (
                                <li>No favorite genres found.</li>
                            )}
                        </ul>
                    </div>

                    <div className="book-recommendations-section">
                        {Object.keys(recommendedBooks).length > 0 ? (
                            Object.entries(recommendedBooks).map(([genre, books]) => (
                                <div key={genre} className="genre-recommendations">
                                    <h3>{genre} Recommendations</h3>
                                    <div className="book-list-genre">
                                        {books.length > 0 ? books.map((item) => (
                                            <div key={item.id} className="book-card-genre">
                                                <img src={item.volumeInfo?.imageLinks?.thumbnail} alt="Book cover" />
                                                <div className="book-details">
                                                    <h4>{item.volumeInfo?.title}</h4>
                                                    <p>by {item.volumeInfo?.authors?.join(', ')}</p>
                                                    <Link 
                                                        to={`/book/${item.id}/${encodeURIComponent(item.volumeInfo?.title)}`} 
                                                        className="button-view-details"
                                                        onClick={() => this.handleBookClick(item.id, item.volumeInfo?.title)}
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        )) : (
                                            <p>No books available for this genre.</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No book recommendations found.</p>
                        )}
                    </div>
                </div>
            );
        }
    }
}

export default Book;
