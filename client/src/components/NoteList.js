import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function NoteList({ notes,setNotes, filteredNotes, onNoteDeleted, setFilteredNotes, handleTagSearchClick, setSearchTerm, searchTerm  }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  // const dragItem = useRef(null);
  // const offset = useRef({ x: 0, y: 0 });

  const [availableTags, setAvailableTags] = useState([]);
  useEffect(()=>{
    axios.get(`${apiUrl}/tags`)
      .then((response) => {
        setAvailableTags(response.data);
      })
      .catch(error => console.error('Error fetching tags:', error));
  },[notes,filteredNotes,apiUrl])
  

  const deleteTag = (e) => {
    // call delete tag api
    const noteId = e.target.dataset.noteid;
    const tagName = e.target.name
    axios
      .delete(`${apiUrl}/tags/${noteId}/${tagName}`)
      .then((response) => {
        const {noteId, tagName} = response.data;
        
        setFilteredNotes(notes.map((note) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          tags: noteId === note.id ? note.tags.filter((tag)=>tag !== tagName): note.tags
        })));

        setNotes(notes.map((note) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          tags: noteId === note.id ? note.tags.filter((tag)=>tag !== tagName): note.tags
        })));

      })
      .catch((error) => console.error("Error deleting note:", error));
  }

  // const handleDragStart = (e, noteId) => {
  //   dragItem.current = e.target;
  //   offset.current = {
  //     x: e.clientX - e.target.getBoundingClientRect().left,
  //     y: e.clientY - e.target.getBoundingClientRect().top,
  //   };
  //   e.target.style.position = "absolute";
  //   e.target.style.zIndex = 1000;
  // };

  // const handleDrag = (e) => {
  //   if (dragItem.current) {
  //     const element = dragItem.current;
  //     if (element) {
  //       element.style.left = `${e.clientX - offset.current.x}px`;
  //       element.style.top = `${e.clientY - offset.current.y}px`;
  //     }
  //   }
  // };

  // const handleDragEnd = () => {
  //   if (dragItem.current) {
  //     dragItem.current.style.zIndex = "auto";
  //   }
  //   dragItem.current = null;
  // };

  const handleDeleteClick = (id, onNoteDeleted) => {
    axios
      .delete(`${apiUrl}/notes/${id}`)
      .then(() => {
        onNoteDeleted(id);
      })
      .catch((error) => console.error("Error deleting note:", error));
  };

  
  return (
    <div className="p-4">
      <select
        type="text"
        className="search-bar"
        placeholder="Search by tags..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      >
        <option value="">Select a tag...</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
      </select>
      <button className="search-button" onClick={handleTagSearchClick} text-align="center">
        GO
      </button>

      <button className='clear-button' onClick={() => {
        setSearchTerm("");
        setFilteredNotes(notes)
      }}> Clear</button>
      <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
      <div className="grid gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note._id}
            id={note._id}
            className="note-card"
            //   style={{ cursor: 'grab' }}
          >
            <h3 className="font-semibold text-lg">{note.title}</h3>
            <p>{note.content}</p>
            <span>
              {note.tags.map((tag) => (
                <p className="tag" key={tag}>
                  {tag}
                  <button data-noteid={note.id} name={tag} onClick={deleteTag}>x</button>
                </p>
              ))}
            </span>
            <button
              className="delete-button"
              onClick={() => handleDeleteClick(note.id, onNoteDeleted)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteList;
