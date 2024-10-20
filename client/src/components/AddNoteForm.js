import React, { useState } from 'react';
import axios from 'axios';
// import * as natural from 'natural';

function AddNoteForm({ onNoteAdded }) {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    
const handleAddNoteClick = () => {
if (title && content) {
    axios.post(`${apiUrl}/extract-tags`, { content })
      .then(response => {
        const tags = response.data.tags;
        axios.post(`${apiUrl}/api/notes`, { title, content, tags })
          .then(response => {
            onNoteAdded(response.data);
            setTitle('');
            setContent('');
          })
          .catch(error => console.error('Error adding note:', error));
      })
      .catch(error => console.error('Error extracting tags:', error));
}
};
      
  
  
  
    return (
      <div className="p-4 mb-4 bg-gray-100 rounded">
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            required
          ></textarea>
        </div>
        <button type="button" onClick={handleAddNoteClick} className="bg-blue-600 text-white p-2 rounded">Add Note</button>
      </div>
    );
  }

export default AddNoteForm;