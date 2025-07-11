import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './BookDetails.css';

const BookDetails = () => {
    const { id } = useParams(); // Get the book ID from the URL
    const [book, setBook] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isReading, setIsReading] = React.useState(false); // State to track if the book is being read aloud
    const [utterance, setUtterance] = React.useState(null); // Store the utterance for controlling speech
    const [language, setLanguage] = React.useState('en'); // Default language (English)
    const [translatedDescription, setTranslatedDescription] = React.useState(null); // Store translated text
    const [translationError, setTranslationError] = React.useState(null); // Error state for translation
    const [voices, setVoices] = React.useState([]); // State to store available voices
    const [selectedVoice, setSelectedVoice] = React.useState(null); // State to track the selected voice

    // Construct the URL for fetching book details
    const SEARCH_URL = `https://www.googleapis.com/books/v1/volumes/${id}`;

    React.useEffect(() => {
        // Fetch book details using the ID
        axios.get(SEARCH_URL)
            .then(response => {
                setBook(response.data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err);
                setIsLoading(false);
            });

        // Load voices available in the system
        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            setVoices(availableVoices);
            setSelectedVoice(availableVoices[0]); // Default to the first available voice
        };

        // Check voices when they are loaded
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            loadVoices(); // For browsers that don't fire the 'voiceschanged' event
        }
    }, [SEARCH_URL]);

    // Function to handle translation using LibreTranslate
    const handleTranslate = async (lang) => {
        if (book && book.volumeInfo?.description) {
            const textToTranslate = book.volumeInfo.description;
            console.log('Translating:', textToTranslate);  // Debugging: Log the text being translated
            try {
                // Call the LibreTranslate API
                const response = await axios.post('https://libretranslate.de/translate', {
                    q: textToTranslate,
                    source: 'en',  // Default source language (English)
                    target: lang,  // Selected target language (e.g., 'hi' for Hindi, 'ta' for Tamil)
                    format: 'text',
                });

                setTranslatedDescription(response.data.translatedText);
                setTranslationError(null);  // Clear any previous translation errors
            } catch (err) {
                console.error('Error translating text:', err);
                setTranslationError('Translation failed. Please try again later.');
            }
        } else {
            setTranslationError('No description available for translation.');
        }
    };

    // Function to handle "Read Aloud"
    const handleReadAloud = () => {
        const text = translatedDescription || book.volumeInfo?.description;
        if (text && selectedVoice) {
            const newUtterance = new SpeechSynthesisUtterance(text);
            newUtterance.voice = selectedVoice;
            newUtterance.onend = () => {
                setIsReading(false); // Reset the state when the speech ends
            };

            speechSynthesis.speak(newUtterance);
            setUtterance(newUtterance);
            setIsReading(true);
        }
    };

    // Function to pause reading
    const handlePauseReading = () => {
        if (utterance) {
            speechSynthesis.pause();
        }
    };

    // Function to resume reading
    const handleResumeReading = () => {
        if (utterance) {
            speechSynthesis.resume();
        }
    };

    // Function to stop reading
    const handleStopReading = () => {
        if (utterance) {
            speechSynthesis.cancel();
            setIsReading(false);
            setUtterance(null);
        }
    };

    // Function to rewind (start over) reading
    const handleRewindReading = () => {
        const text = translatedDescription || book.volumeInfo?.description;
        if (text) {
            const newUtterance = new SpeechSynthesisUtterance(text);
            newUtterance.voice = selectedVoice;
            speechSynthesis.cancel(); // Stop any current speech
            speechSynthesis.speak(newUtterance); // Start from the beginning
            setUtterance(newUtterance);
            setIsReading(true);
        }
    };

    const handleLanguageChange = (event) => {
        const lang = event.target.value;
        setLanguage(lang);
        handleTranslate(lang); // Translate the description when the language is changed
    };

    // Handle voice change
    const handleVoiceChange = (event) => {
        const voice = voices.find(v => v.name === event.target.value);
        setSelectedVoice(voice); // Set the selected voice
    };

    if (isLoading) {
        return <div className="loading">Loading book details...</div>;
    }

    if (error) {
        return <div className="error">Error fetching book details: {error.message}</div>;
    }

    return (
        <div className="book-details-container">
            <div className="book-header">
                <h2 className="book-title">{book.volumeInfo?.title}</h2>
                <p className="book-authors">by {book.volumeInfo?.authors?.join(', ')}</p>
            </div>

            <div className="book-info">
                <img 
                    className="book-cover" 
                    src={book.volumeInfo?.imageLinks?.thumbnail} 
                    alt="Book cover" 
                />

                <div className="book-details">
                    <p className="book-description">
                        <strong>Description:</strong> {translatedDescription || book.volumeInfo?.description || "No description available."}
                    </p>
                    <p className="book-published-date">
                        <strong>Published Date:</strong> {book.volumeInfo?.publishedDate || "Not available."}
                    </p>
                    <p className="book-page-count">
                        <strong>Page Count:</strong> {book.volumeInfo?.pageCount || "Not available."}
                    </p>
                    <p className="book-categories">
                        <strong>Categories:</strong> {book.volumeInfo?.categories?.join(', ') || "Not available."}
                    </p>

                    <a 
                        className="purchase-link" 
                        href={book.volumeInfo?.infoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Purchase Book
                    </a>

                    {/* Language Selection Dropdown */}
                    <div className="language-selector">
                        <label htmlFor="language">Select Language:</label>
                        <select
                            id="language"
                            value={language}
                            onChange={handleLanguageChange}
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="ta">Tamil</option>
                        </select>
                    </div>

                    {/* Voice Selection Dropdown */}
                    <div className="voice-selector">
                        <label htmlFor="voice">Select Voice:</label>
                        <select
                            id="voice"
                            value={selectedVoice?.name || ''}
                            onChange={handleVoiceChange}
                        >
                            {voices.map((voice, index) => (
                                <option key={index} value={voice.name}>{voice.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Translation Error Message */}
                    {translationError && (
                        <div className="error-message">{translationError}</div>
                    )}

                    {/* Read Aloud Buttons */}
                    <div className="read-aloud-container">
                        {isReading ? (
                            <div>
                                <button onClick={handlePauseReading}>Pause</button>
                                <button onClick={handleResumeReading}>Resume</button>
                                <button onClick={handleRewindReading}>Rewind</button>
                                <button onClick={handleStopReading}>Stop</button>
                            </div>
                        ) : (
                            <button onClick={handleReadAloud}>Read Aloud</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
