const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const natural = require("natural");
const TfIdf = natural.TfIdf;
const sqlite3 = require('sqlite3').verbose();


// const nlp = require("compromise");


const db = new sqlite3.Database('notes.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    createdAt datetime DEFAULT (CURRENT_TIMESTAMP)
)`);

db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    noteId INTEGER,
    tag TEXT,
    FOREIGN KEY(noteId) REFERENCES notes(id)
)`);

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

function runAsync(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                return reject(err);
            }
            // Resolve with the last inserted ID
            resolve(this.lastID);
        });
    });
}


const extractTags = (text) => {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  const tags = [];
  tfidf.listTerms(0).forEach((term) => {
    if (term.tfidf > 0.4) tags.push(term.term); // Get terms with high relevance
  });

  return tags.slice(0, 5).map((tag) => tag.toLowerCase());
};

// Step 3: Create a route to extract tags from content
app.post("/api/extract-tags", (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const tags = extractTags(content);

  res.json({ tags });
});

// Step 4: Create a route to add a new note
app.post('/api/notes', async (req, res) => {
    const { title, content, tags } = req.body;
  
    console.log(title)
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
  
    try {
      const noteId = await runAsync(
        `INSERT INTO notes (title, content) VALUES (?, ?)`,
        [title, content]
      );

      // Insert tags into the tags table
      for (const tag of tags) {
        try {
          await runAsync(`INSERT INTO tags (tag, noteId) VALUES (?, ?)`, [tag, noteId]);
        } catch (err) {
          console.warn(err);
        }
      }
  
      res.status(201).json({ id: noteId, title, content, tags });
    } catch (err) {
        console.log(err)
      res.status(500).json({ error: 'Failed to save note' });
    }
});
  
app.get('/api/notes', (req, res) => {
    const { tag } = req.query;

    if(tag)
      db.all(`SELECT notes.id, notes.title, notes.content, notes.createdAt,
        GROUP_CONCAT(tags.tag) as tags
        FROM notes
        LEFT JOIN tags ON notes.id = tags.noteId
        WHERE tags.tag LIKE ?
        GROUP BY notes.id`, [tag], (err, rows) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch notes' });
          }
    
          // Transform the tags string into an array
          const transformedRows = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          // console.log(transformedRows)
          res.json(transformedRows);
        });
    else
      db.all(`SELECT n.id, n.title, n.content, n.createdAt, 
              GROUP_CONCAT(t.tag) AS tags
              FROM notes n
              LEFT JOIN tags t ON INSTR(n.id, t.noteId) > 0
              GROUP BY n.id`, [], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch notes' });
        }

        // Transform the tags string into an array
        const transformedRows = rows.map(row => ({
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        }));
        console.log(transformedRows)
        res.json(transformedRows);
      });
});

app.delete('/api/notes/:id', async (req, res) => {
    const { id } = req.params;
  
    try{

        await runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
        
        await runAsync(`DELETE FROM tags WHERE noteId = ?`, [id]);

        res.status(200).json({ message: 'Note deleted successfully' });

    }catch(err){
        return res.status(500).json({ error: 'Failed to delete note' });
    }
    
  });

app.get('/api/tags', (req, res) => {
    db.all(`SELECT tag from tags`, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tags' });
      }

      const resultTags = [];
      // Transform the tags string into an array
      rows.forEach(row => {
        resultTags.push(row.tag)
      });
      res.json(resultTags);
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
