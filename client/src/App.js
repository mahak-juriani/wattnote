import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import NoteList from "./components/NoteList";
import AddNoteForm from "./components/AddNoteForm";
import axios from "axios";

function App() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect(()=>{
  //   axios.get(`http://localhost:5000/api/notes`)
  //   .then((response) => {
  //       setNotes(response.data)
  //   })
  //   .catch(error => console.error('Error fetching notes:', error));
  // },[])

  useEffect(() => {
    axios
      .get(`${apiUrl}/notes`)
      .then((response) => {
        setNotes(response.data);
        setFilteredNotes(response.data);
      })
      .catch((error) => console.error("Error fetching notes:", error));
  }, []);

  const handleNoteAdded = (newNote) => {
    setNotes([newNote, ...notes]);
  };

  const handleNoteDeleted = (deletedId) => {
    setNotes(notes.filter((note) => note.id !== deletedId));
  };

  const handleTagSearchClick = () => {
    axios
      .get(`${apiUrl}/notes?tag=${searchTerm}`)
      .then((response) => {
        return setFilteredNotes(response.data);
      })
      .catch((error) => console.error("Error fetching notes:", error));
  };

  return (
    <div className="App">
      <Header />
      <main className="p-4">
        <AddNoteForm onNoteAdded={handleNoteAdded} />
        <NoteList
          notes={notes}
          filteredNotes={filteredNotes}
          onNoteDeleted={handleNoteDeleted}
          setFilteredNotes={setFilteredNotes}
          handleTagSearchClick={handleTagSearchClick}
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
        />
      </main>
    </div>
  );
}

export default App;
