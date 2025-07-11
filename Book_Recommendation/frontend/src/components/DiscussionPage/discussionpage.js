import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './discussionpage.css'; // Import your updated CSS file

const DiscussionPage = () => {
    const [message, setMessage] = useState('');
    const [discussions, setDiscussions] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);

    useEffect(() => {
        const fetchDiscussions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/discussions');
                setDiscussions(response.data);
            } catch (error) {
                console.error("Error fetching discussions:", error);
            }
        };
        fetchDiscussions();
    }, []);

    const handlePostMessage = async (e) => {
        e.preventDefault();
        const username = localStorage.getItem('username'); // Get username from local storage

        try {
            const response = await axios.post('http://localhost:5000/api/discussions', {
                username,
                message
            });
            setDiscussions([...discussions, response.data]);
            setMessage(''); // Clear the message input
        } catch (error) {
            console.error("Error posting message:", error);
        }
    };

    const handleReply = async (discussionId) => {
        const username = localStorage.getItem('username');

        try {
            const response = await axios.post(`http://localhost:5000/api/discussions/${discussionId}/reply`, {
                username,
                message: replyMessage
            });
            setDiscussions(discussions.map(discussion => 
                discussion._id === discussionId ? response.data : discussion
            ));
            setReplyMessage(''); // Clear the reply input
            setSelectedDiscussionId(null); // Deselect the discussion
        } catch (error) {
            console.error("Error replying to discussion:", error);
        }
    };

    return (
        <div className="discussion-page">
            <h1 className="discussion-title">Discussion Board</h1>
            <form onSubmit={handlePostMessage} className="post-form">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Post a message..."
                    maxLength={80}
                    className="message-input"
                />
                <button type="submit" className="post-button">Post Message</button>
            </form>

            <div className="discussion-list">
                {discussions.map((discussion) => (
                    <div key={discussion._id} className="discussion-item">
                        <h3 className="discussion-username">{discussion.username}</h3>
                        <p className="discussion-message">{discussion.message}</p>
                        <button className="reply-button" onClick={() => setSelectedDiscussionId(discussion._id)}>
                            Reply
                        </button>
                        <div className="discussion-replies">
                            {discussion.replies.map((reply, index) => (
                                <div key={index} className="reply-item">
                                    <strong>{reply.username}:</strong> {reply.message}
                                </div>
                            ))}
                            {selectedDiscussionId === discussion._id && (
                                <div className="reply-form">
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Write a reply..."
                                        maxLength={80}
                                        className="reply-input"
                                    />
                                    <button 
                                        className="submit-reply-button" 
                                        onClick={() => handleReply(discussion._id)}>
                                        Submit Reply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiscussionPage;
