import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function NoteList({ notes,setNotes, filteredNotes, onNoteDeleted, setFilteredNotes, handleTagSearchClick, setSearchTerm, searchTerm  }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  // const dragItem = useRef(null);
  // const offset = useRef({ x: 0, y: 0 });

  // State to track the new tag being added to a note
  const [newTag, setNewTag] = useState({});
  
  const [availableTags, setAvailableTags] = useState([]);
  useEffect(()=>{
    axios.get(`${apiUrl}/tags`)
      .then((response) => {
        setAvailableTags(response.data);
      })
      .catch(error => console.error('Error fetching tags:', error));
  },[notes,filteredNotes,apiUrl])
  
    // Handle adding a new tag to a note
    const handleAddTag = (noteId) => {
      debugger;
      const tag = newTag[noteId];
      if (!tag) return;

      axios
        .post(`${apiUrl}/tags`, { noteId, tag })
        .then((response) => {
          // Update the notes state with the new tag
          setNotes(
            notes.map((note) =>
              note._id === noteId
                ? { ...note, tags: [...note.tags, tag] }
                : note
            )
          );
          setFilteredNotes(
            filteredNotes.map((note) =>
              note._id === noteId
                ? { ...note, tags: [...note.tags, tag] }
                : note
            )
          );
          setNewTag({ ...newTag, [noteId]: "" }); // Clear the input after adding the tag
        })
        .catch((error) => console.error("Error adding tag:", error));
    };

  const deleteTag = (e) => {
    // call delete tag api
    const noteId = e.currentTarget.dataset.noteid;
    const tagName = e.currentTarget.name

    axios
      .delete(`${apiUrl}/tags/${noteId}/${tagName}`)
      .then((response) => {
        const {noteId, tagName} = response.data;
        
        setFilteredNotes(notes.map((note) => ({
          _id: note._id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          tags: noteId === note._id ? note.tags.filter((tag)=>tag !== tagName): note.tags
        })));

        setNotes(notes.map((note) => ({
          _id: note._id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          tags: noteId === note._id ? note.tags.filter((tag)=>tag !== tagName): note.tags
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
                  <button data-noteid={note._id} key={tag} name={tag} onClick={deleteTag}>x</button>
                </p>
              ))}
            </span>
            {/* Add new tag input field */}
            <div className="add-tag-container">
              <input
                type="text"
                className="tag-input" 
                value={newTag[note._id] || ""}
                onChange={(e) => setNewTag({ ...newTag, [note._id]: e.target.value })}
                placeholder="Add a tag..."
              />
              <button className="add-tag-button" onClick={() => handleAddTag(note._id)}>Add Tag</button>
            </div>

            <button
              className="delete-button"
              onClick={() => handleDeleteClick(note._id, onNoteDeleted)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <p className="created-at">
              Created on: {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteList;
