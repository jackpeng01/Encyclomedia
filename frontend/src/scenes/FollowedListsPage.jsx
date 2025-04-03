import React, { useState, useEffect } from "react";
import {
  Typography, Box, Button, Grid, Card, CardContent, TextField,
  InputAdornment, Menu, MenuItem, CircularProgress, Alert
} from "@mui/material";
import { Search as SearchIcon, Sort as SortIcon, Public as PublicIcon, Bookmark as BookmarkIcon } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { getUserByToken } from "../api/users.js";
import ListDetailsPopup from "./ListDetailsPopup";

const FollowedListsPage = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState(null);
  const [lists, setLists] = useState([]);
  const [displayedLists, setDisplayedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortMethod, setSortMethod] = useState("default");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [listDetailsOpen, setListDetailsOpen] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
    };
    if (token) {
      loadUserData();
    }
  }, [token]);

  useEffect(() => {
    const fetchFollowedLists = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:5000/api/users/followed-lists", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setLists(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch followed lists. Please try again later.");
        setLoading(false);
        console.error("❌ Error fetching followed lists:", err);
      }
    };

    if (token) {
      fetchFollowedLists();
    }
  }, [token]);

  useEffect(() => {
    let filtered = [...lists];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(list =>
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const isAscending = sortDirection === "asc";
      
      switch (sortMethod) {
        case "alphabetical":
          return isAscending ? 
            a.name.localeCompare(b.name) : 
            b.name.localeCompare(a.name);
        case "date":
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return isAscending ? dateA - dateB : dateB - dateA;
        default:
          // Default sort by date
          const defaultDateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const defaultDateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return defaultDateB - defaultDateA;
      }
    });
    
    setDisplayedLists(filtered);
  }, [lists, searchTerm, sortMethod, sortDirection]);

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortAnchorEl(null);
  };

  const handleSortMethodSelect = (method) => {
    if (method === sortMethod) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortMethod(method);
      setSortDirection(method === "alphabetical" ? "asc" : "desc");
    }
    handleCloseSortMenu();
  };

  const handleListClick = (listId) => {
    const list = lists.find(list => list._id === listId);
    if (list) {
      setSelectedList(list);
      setListDetailsOpen(true);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar userData={userData} />

      <Box sx={{ mt: 10, px: 8, width: "100%" }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Followed Lists
          </Typography>
          <Box>
            <TextField
              placeholder="Search lists..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mr: 2, width: 250 }}
            />
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              sx={{ mr: 2 }}
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleCloseSortMenu}
            >
              <MenuItem
                onClick={() => handleSortMethodSelect('alphabetical')}
                selected={sortMethod === 'alphabetical'}
              >
                Alphabetical {sortMethod === 'alphabetical' && (sortDirection === 'asc' ? '(A to Z)' : '(Z to A)')}
              </MenuItem>
              <MenuItem
                onClick={() => handleSortMethodSelect('date')}
                selected={sortMethod === 'date'}
              >
                Date Added {sortMethod === 'date' && (sortDirection === 'desc' ? '(Newest first)' : '(Oldest first)')}
              </MenuItem>
            </Menu>
            <Button
              variant="outlined"
              startIcon={<PublicIcon />}
              onClick={() => navigate("/public-lists")}
              sx={{ mr: 2 }}
            >
              Discover Lists
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/lists")}
            >
              My Lists
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {displayedLists.length === 0 ? (
              <Box sx={{ textAlign: "center", my: 10 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchTerm ? "No lists found matching your search" : "You haven't followed any lists yet"}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate("/public-lists")}
                  sx={{ mt: 2 }}
                >
                  Discover Public Lists
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {displayedLists.map((list) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={list._id}>
                    <Card
                      onClick={() => handleListClick(list._id)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <BookmarkIcon
                            fontSize="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="h6" noWrap>
                            {list.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{
                          mb: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          height: "3em"
                        }}>
                          {list.description || "No description"}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            {list.items?.length || 0} items
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            By {list.user_id}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>

      {selectedList && (
        <ListDetailsPopup
          open={listDetailsOpen}
          list={selectedList}
          userData={userData}
          onClose={() => setListDetailsOpen(false)}
          onUpdateList={() => {
            const fetchFollowedLists = async () => {
              try {
                const response = await axios.get("http://127.0.0.1:5000/api/users/followed-lists", {
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                });
                setLists(response.data);
              } catch (err) {
                console.error("Error refreshing followed lists:", err);
              }
            };
            fetchFollowedLists();
          }}
        />
      )}
    </Box>
  );
};

export default FollowedListsPage;