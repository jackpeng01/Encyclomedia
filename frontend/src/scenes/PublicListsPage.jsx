import React, { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    IconButton,
    CircularProgress,
    Alert
} from "@mui/material";
import {
    Search as SearchIcon,
    Sort as SortIcon,
    Public as PublicIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUserByToken } from "../api/users.js";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import ListDetailsPopup from "./ListDetailsPopup";

const PublicListsPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const token = useSelector((state) => state.auth.token);

    const [lists, setLists] = useState([]);
    const [filteredLists, setFilteredLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortMethod, setSortMethod] = useState("recent");
    const [sortDirection, setSortDirection] = useState("desc");
    const [sortAnchorEl, setSortAnchorEl] = useState(null);

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
        const fetchPublicLists = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://127.0.0.1:5000/api/public-lists", {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                });
                setLists(response.data);
                setFilteredLists(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch public lists. Please try again later.");
                setLoading(false);
                console.error("❌ Error fetching public lists:", err);
            }
        };

        fetchPublicLists();
    }, []);

    useEffect(() => {
        // Apply filtering
        let result = [...lists];

        if (searchTerm) {
            result = result.filter(list =>
                list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            const isAscending = sortDirection === "asc";

            switch (sortMethod) {
                case "alphabetical":
                    const comparison = a.name.localeCompare(b.name);
                    return isAscending ? comparison : -comparison;
                case "recent":
                    const dateA = a.updated_at ? new Date(a.updated_at) : a.created_at ? new Date(a.created_at) : new Date(0);
                    const dateB = b.updated_at ? new Date(b.updated_at) : b.created_at ? new Date(b.created_at) : new Date(0);
                    return isAscending ? dateA - dateB : dateB - dateA;
                case "popularity":
                    const countA = a.items?.length || 0;
                    const countB = b.items?.length || 0;
                    return isAscending ? countA - countB : countB - countA;
                default:
                    return 0;
            }
        });

        setFilteredLists(result);
    }, [lists, searchTerm, sortMethod, sortDirection]);

    const handleViewList = (listId) => {
        const list = filteredLists.find(list => list._id === listId);
        if (list) {
            setSelectedList(list);
            setListDetailsOpen(true);
        }
    };

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
            if (method === "alphabetical") {
                setSortDirection("asc"); // A to Z by default
            } else {
                setSortDirection("desc"); // Newest first or Most items first by default
            }
            setSortMethod(method);
        }

        handleCloseSortMenu();
    };

    const getSortLabel = () => {
        switch (sortMethod) {
            case "alphabetical":
                return `Alphabetical ${sortDirection === "asc" ? "(A to Z)" : "(Z to A)"}`;
            case "recent":
                return `Date Added ${sortDirection === "desc" ? "(Newest first)" : "(Oldest first)"}`;
            case "popularity":
                return `Popularity ${sortDirection === "desc" ? "(Most items first)" : "(Fewest items first)"}`;
            default:
                return "Sort";
        }
    };

    const handleUpdateList = async (updatedList) => {
        try {
            const isCollaborator = updatedList.collaborators?.includes(userData?.username);
            if (isCollaborator || updatedList.user_id === userData?.username) {
                await axios.put(`http://127.0.0.1:5000/api/lists/${updatedList._id}`, updatedList, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                
                const response = await axios.get("http://127.0.0.1:5000/api/public-lists");
                setLists(response.data);
            } else {
                console.log("Not authorized to update this list");
            }
        } catch (error) {
            console.error("❌ Error updating list:", error);
            setError("Failed to update list. Please try again.");
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                overflowX: "hidden",
            }}
        >
            {/* Navbar */}
            <Navbar userData={userData} />

            {/* Main Content */}
            <Box
                sx={{
                    mt: 10,
                    px: 8,
                    width: "100%",
                }}
            >
                {/* Header with title and search */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                    <Typography variant="h4">
                        Discover Public Lists
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
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
                                ),
                            }}
                            sx={{ mr: 2, width: 250 }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<SortIcon />}
                            endIcon={sortDirection === "asc" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            onClick={handleSortClick}
                        >
                            {getSortLabel()}
                        </Button>
                        <Menu
                            anchorEl={sortAnchorEl}
                            open={Boolean(sortAnchorEl)}
                            onClose={handleCloseSortMenu}
                        >
                            <MenuItem
                                onClick={() => handleSortMethodSelect("alphabetical")}
                                selected={sortMethod === "alphabetical"}
                            >
                                Alphabetical {sortMethod === "alphabetical" && (sortDirection === "asc" ? "(A to Z)" : "(Z to A)")}
                            </MenuItem>
                            <MenuItem
                                onClick={() => handleSortMethodSelect("recent")}
                                selected={sortMethod === "recent"}
                            >
                                Date Added {sortMethod === "recent" && (sortDirection === "desc" ? "(Newest first)" : "(Oldest first)")}
                            </MenuItem>
                            <MenuItem
                                onClick={() => handleSortMethodSelect("popularity")}
                                selected={sortMethod === "popularity"}
                            >
                                Popularity {sortMethod === "popularity" && (sortDirection === "desc" ? "(Most items)" : "(Fewest items)")}
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError(null)}
                        sx={{ mb: 3 }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* No Results State */}
                        {filteredLists.length === 0 ? (
                            <Box sx={{ textAlign: "center", my: 10 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No lists found matching your criteria
                                </Typography>
                            </Box>
                        ) : (
                            /* Lists Grid */
                            <Grid container spacing={3}>
                                {filteredLists.map((list) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={list._id}>
                                        <Card
                                            onClick={() => handleViewList(list._id)}
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
                                                    <PublicIcon
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

            {/* List Details Popup */}
            {selectedList && (
                <ListDetailsPopup
                    open={listDetailsOpen}
                    list={selectedList}
                    userData={userData}
                    onClose={() => {
                        setListDetailsOpen(false);
                    }}
                    onUpdateList={handleUpdateList}
                />
            )}
        </Box>
    );
};

export default PublicListsPage;