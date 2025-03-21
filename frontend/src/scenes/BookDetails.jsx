import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import { Box } from "@mui/material";

const BookDetails = () => {
  const { id } = useParams(); 
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [readDate, setReadDate] = useState("");
  const [tags, setTags] = useState("");
  const [savedForLater, setSavedForLater] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [readLaterList, setReadLaterList] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        try {
          const fetchedUserData = await getUserByToken(token);
          setUserData(fetchedUserData);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };
    loadUserData();
  }, [token]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/book/${id}`);
        setBook(response.data.book);
      } catch (err) {
        setError("Failed to load book details.");
      }
    };

    fetchBookDetails();
  }, [id]);

  useEffect(() => {
    const fetchReadLaterList = async () => {
      if (!userData) return;

      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/book/read_later?username=${userData.username}`);
        setReadLaterList(response.data);

        // Check if the book is already in read later
        const foundBook = response.data.find((item) => item.bookId === id);
        if (foundBook) {
          setSavedForLater(true);
          setCurrentBook(foundBook);
        }
      } catch (error) {
        console.error("Error fetching read later list:", error);
      }
    };

    fetchReadLaterList();
  }, [userData, id]);

  const formatPublishDate = (dateString) => {
    if (!dateString || dateString === "Unknown Date") return "Unknown";
    const dateObj = new Date(dateString);
    return isNaN(dateObj.getTime()) ? dateString : dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const cleanDescription = (description) => {
    if (!description) return "No description available.";

    let cleaned = description.split(/\[\s*source\s*\]|\[\d+\]/i)[0].trim();
    if (cleaned.endsWith("(")) {
      cleaned = cleaned.slice(0, -1).trim();
    }
    return cleaned;
  };
/*
  const handleLogBook = async () => {
    if (!userData) {
      alert("Please Login!");
      return;
    }
    try {
      const payload = {
        read_date: readDate,
        tags: tags,
        username: userData.username,
        title: book.title,
        cover: book.cover_url,
      };

      const response = await axios.post(`http://127.0.0.1:5000/api/book/log/${id}`, payload);
      alert("Book logged successfully!");
      setTags("");
      setReadDate("");
    } catch (error) {
      console.error("Error logging book:", error);
      alert("Failed to log the book. Please try again.");
    }
};
*/


  const handleReadLater = async () => {
    if (!userData) {
      alert("Please Login!");
      return;
    }
    try {
      const payload = {
        username: userData.username,
        title: book.title,
        cover: book.cover_url,
      };

      const response = await axios.post(`http://127.0.0.1:5000/api/book/read_later/${id}`, payload);
      setSavedForLater(true);
      setCurrentBook(response.data);
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Failed to save the book. Please try again.");
    }
  };

  const handleRemove = async () => {
    if (!currentBook) {
      alert("Book not found in Read Later!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/book/remove", {
        username: userData.username,
        entry: currentBook._id,
        section: "readLater",
      });

      if (response.status === 200) {
        setSavedForLater(false);
        setReadLaterList((prev) => prev.filter((item) => item.bookId !== id));
      } else {
        throw new Error("Failed to remove the book.");
      }
    } catch (error) {
      console.error("Error removing book:", error);
      alert("An error occurred while trying to remove the book.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!book) return <p>Loading book details...</p>;

  return (
    <div>
      <Box sx={{ paddingTop: 10 }}>
        <Navbar userData={userData} />

        {/* Main Container */}
        <Box
          sx={{
            maxWidth: "50vw",
            margin: "0 auto",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Top Section: Cover and Log/Save */}
          <Box sx={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
            {/* Cover Section */}
            <img
              src={book.cover_url || `${process.env.PUBLIC_URL}/default-book-cover.png`}
              alt={book.title}
              style={{
                width: "100%",
                maxWidth: "300px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />

            {/* Log and Save Section */}
            <Box sx={{ flex: 1 }}>
              <h2>Log/Save</h2>
              {/* Log Read Book */}
              <Box sx={{ marginBottom: "1.5rem" }}>
                <label>
                  <strong>Date Read:</strong>
                  <input
                    type="date"
                    value={readDate}
                    onChange={(e) => setReadDate(e.target.value)}
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.25rem",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </label>
              </Box>
              <button style={buttonStyle}>Log Book</button>
              <br />

              {/* Read Later */}
              <button onClick={savedForLater ? handleRemove : handleReadLater} style={buttonStyle} disabled={savedForLater}>
                {savedForLater ? "Already in Read Later" : "Add to Read Later"}
              </button>
            </Box>
          </Box>

          {/* Book Info Section */}
          <Box sx={{ marginTop: "2rem" }}>
            <h1>{book.title}</h1>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Published:</strong> {formatPublishDate(book.publish_date)}</p>
            <h2>Description</h2>
            <p>{cleanDescription(book.description)}</p>
            {book.genres && <p><strong>Genres:</strong> {book.genres.join(", ")}</p>}
          </Box>
        </Box>
      </Box>
    </div>
  );
};

const buttonStyle = { padding: "0.5rem 1rem", borderRadius: "5px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer", marginBottom: "1rem" };

export default BookDetails;
