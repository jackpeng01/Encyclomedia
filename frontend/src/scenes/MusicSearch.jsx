import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";

const MusicSearch = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    const token = useSelector((state) => state.auth.token);
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            if (token) {
                try {
                    const user = await getUserByToken(token);
                    setUserData(user);
                } catch (err) {
                    console.error("Error fetching user data:", err);
                }
            }
        };
        loadUserData();
    }, [token]);

    useEffect(() => {
        const fetchMusic = async () => {
            try {
                setError("");
                const res = await axios.get("http://127.0.0.1:5000/api/music/search", {
                    params: { q: query }
                });
                setTracks(res.data);
            } catch (err) {
                setError("Error fetching music.");
            }
        };

        if (query) fetchMusic();
    }, [query]);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} />
            <h1>Music Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                {tracks.length > 0 ? (
                    tracks.map((track) => (
                        <div key={track.id} style={{ textAlign: "center" }}>
                            <Link to={`/track/${track.id}`}>
                                <img src={track.album.cover_medium} alt={track.title} style={{ width: "100px", height: "100px" }} />
                            </Link>
                            <p>{track.title}</p>
                            <p><i>{track.artist.name}</i></p>
                            <audio controls src={track.preview}></audio>
                        </div>
                    ))
                ) : (
                    <p>No tracks found.</p>
                )}
            </div>
        </div>
    );
};

export default MusicSearch;
