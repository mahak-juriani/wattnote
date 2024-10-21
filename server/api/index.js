const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const natural = require("natural");
const TfIdf = natural.TfIdf;

const db = require('../config/dbConfig')

// Connect to MongoDB (replace with your connection string)
// mongoose.connect('mongodb://localhost:27017/notes', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

const app = express();
const port = 3002;

// Middleware
app.use(bodyParser.json());
// app.use(cors({
//   origin: ['https://wattnote-client.vercel.app'],
//   credentials: true
// }));

const allowedOrigins = ['http://localhost:3000', 'https://wattnote-client.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    console.log(allowedOrigins)
    console.log(origin)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.options('*', cors());

// Define Mongoose Schemas
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);

// Tag extraction function using natural library
const extractTags = (text) => {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  const tags = [];
  tfidf.listTerms(0).forEach((term) => {
    if (term.tfidf > 0.4) tags.push(term.term); // Get terms with high relevance
  });
  return tags.slice(0, 5).map((tag) => tag.toLowerCase());
};

// Route to extract tags from content
app.post("/api/extract-tags", (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }
  const tags = extractTags(content);
  res.json({ tags });
});

// Route to add a new note
app.post('/api/notes', async (req, res) => {
  const { title, content, tags } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// Route to get notes, optionally filtered by tag
app.get('/api/notes', async (req, res) => {
  const { tag } = req.query;

  try {
    let notes;
    if (tag) {
      notes = await Note.find({ tags: tag });
    } else {
      notes = await Note.find({});
    }
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Route to delete a note
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Note.findByIdAndDelete(id);
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Route to delete a specific tag from a note
app.delete('/api/tags/:noteId/:tagName', async (req, res) => {
  const { noteId, tagName } = req.params;

  try {
    const note = await Note.findById(noteId);
    if (note) {
      note.tags = note.tags.filter(tag => tag !== tagName);
      await note.save();
      res.status(200).json({ message: 'Tag deleted successfully', noteId, tagName });
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Route to get all tags
app.get('/api/tags', async (req, res) => {
  try {
    const notes = await Note.find({});
    const allTags = new Set();
    notes.forEach(note => {
      note.tags.forEach(tag => allTags.add(tag));
    });
    res.json([...allTags]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
