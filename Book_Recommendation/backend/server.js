// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Error: ", err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  dob: { type: Date },
  occupation: { type: String },
  genres: [{ type: String }] // Array to store selected genres
});

const User = mongoose.model('User', UserSchema);

// Search Log Schema
const SearchLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  searchTerms: [
    {
      term: { type: String, required: true },
      count: { type: Number, default: 1 }
    }
  ]
});

const SearchLog = mongoose.model('SearchLog', SearchLogSchema);

// ViewedBook Schema
const ViewedBookSchema = new mongoose.Schema({
  username: { type: String, required: true },
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  viewCount: { type: Number, default: 1 }
});

const ViewedBook = mongoose.model('ViewedBook', ViewedBookSchema);

const DiscussionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  message: { type: String, required: true, maxlength: 80 },
  replies: [{ username: String, message: String }]
});

const Discussion = mongoose.model('Discussion', DiscussionSchema);


// Route to log viewed books
app.post('/api/log-viewed-book', async (req, res) => {
  const { username, bookId, bookTitle } = req.body;

  try {
    let viewedBook = await ViewedBook.findOne({ username, bookId });

    if (viewedBook) {
      // Increment view count if book has already been viewed
      viewedBook.viewCount += 1;
      await viewedBook.save();
    } else {
      // Create new entry if the book hasn't been viewed
      const newViewedBook = new ViewedBook({ username, bookId, bookTitle, viewCount: 1 });
      await newViewedBook.save();
    }

    res.status(200).json({ message: "Viewed book logged successfully" });
  } catch (error) {
    console.error("Error logging viewed book:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, username, dob, occupation, genres, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ name, email, username, dob, occupation, genres, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: "Login successful", token });
  } else {
    res.status(400).json({ error: "Invalid credentials" });
  }
});

// Route to handle search logging and updating search data count
// Log search term and update count
app.post('/api/log-search-term', async (req, res) => {
  const { username, searchTerm } = req.body;

  try {
    let userLog = await SearchLog.findOne({ username });

    // If user log exists, update term count; otherwise, create new entry
    if (userLog) {
      const termIndex = userLog.searchTerms.findIndex(termObj => termObj.term === searchTerm);

      if (termIndex !== -1) {
        userLog.searchTerms[termIndex].count += 1;
      } else {
        userLog.searchTerms.push({ term: searchTerm, count: 1 });
      }

      await userLog.save();
    } else {
      // Create new log entry if no log exists for the user
      const newLog = new SearchLog({
        username,
        searchTerms: [{ term: searchTerm, count: 1 }]
      });
      await newLog.save();
    }

    res.status(200).json({ message: "Search term logged successfully" });
  } catch (error) {
    console.error("Error logging search term:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Check username availability
app.get('/check-username/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.json({ available: !user });
});

// Get User Genres
app.get('/api/users/genres', async (req, res) => {
  const { username, email } = req.query;

  try {
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ genres: user.genres });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route to get viewed books for a specific user
app.get('/api/viewed-books', async (req, res) => {
  const { username } = req.query;

  try {
    const viewedBooks = await ViewedBook.find({ username });

    if (!viewedBooks || viewedBooks.length === 0) {
      return res.status(404).json({ message: 'No viewed books found for this user.' });
    }

    res.status(200).json({ viewedBooks });
  } catch (error) {
    console.error('Error fetching viewed books:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route to post a discussion message
app.post('/api/discussions', async (req, res) => {
  const { username, message } = req.body;

  try {
      const newDiscussion = new Discussion({ username, message });
      await newDiscussion.save();
      res.status(201).json(newDiscussion);
  } catch (error) {
      console.error("Error saving discussion:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// Route to get all discussions
app.get('/api/discussions', async (req, res) => {
  try {
      const discussions = await Discussion.find();
      res.status(200).json(discussions);
  } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// Route to reply to a discussion message
app.post('/api/discussions/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { username, message } = req.body;

  try {
      const discussion = await Discussion.findById(id);
      if (!discussion) return res.status(404).json({ message: "Discussion not found" });

      discussion.replies.push({ username, message });
      await discussion.save();
      res.status(200).json(discussion);
  } catch (error) {
      console.error("Error replying to discussion:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// Route to get user profile by username
app.get('/api/users/profile', async (req, res) => {
  const username = req.query.username;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without password
    const { password, ...userData } = user.toObject();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// server.js
app.put('/api/users/profile', async (req, res) => {
  const { username, name, dob, occupation, genres } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { name, dob, occupation, genres },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...userData } = user.toObject();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
