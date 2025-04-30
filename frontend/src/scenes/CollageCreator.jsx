import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import html2canvas from "html2canvas";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    InputAdornment,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Tabs,
    Tab,
    Snackbar,
    Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MovieIcon from "@mui/icons-material/Movie";
import BookIcon from "@mui/icons-material/Book";
import TvIcon from "@mui/icons-material/Tv";

const CollageCreator = () => {
    const token = useSelector((state) => state.auth.token);
    const [userData, setUserData] = useState(null);
    const [gridSize, setGridSize] = useState("3x3");
    const [collageItems, setCollageItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState("movie");
    const [collageName, setCollageName] = useState("");
    const [savedCollages, setSavedCollages] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [showTitles, setShowTitles] = useState(false);
    const [exportFormat, setExportFormat] = useState("png");
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [isEditing, setIsEditing] = useState(false);
    const [currentCollageId, setCurrentCollageId] = useState(null);

    const collageRef = useRef(null);

    const gridDimensions = {
        "3x3": { rows: 3, cols: 3 },
        "4x4": { rows: 4, cols: 4 },
        "5x5": { rows: 5, cols: 5 }
    };

    const { rows, cols } = gridDimensions[gridSize];
    const totalCells = rows * cols;

    useEffect(() => {
        setCollageItems(Array(totalCells).fill(null));
    }, [gridSize, totalCells]);

    useEffect(() => {
        const loadUserData = async () => {
            if (token) {
                try {
                    const fetchedUserData = await getUserByToken(token);
                    setUserData(fetchedUserData);
                    fetchSavedCollages(fetchedUserData.username);
                } catch (err) {
                    console.error("Error fetching user data:", err);
                }
            }
        };

        loadUserData();
    }, [token]);

    const fetchSavedCollages = async (username) => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:5000/api/collages?username=${username}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            setSavedCollages(response.data || []);
        } catch (error) {
            console.error("Error fetching saved collages:", error);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.trim() === "") return;

        try {
            let endpoint;
            switch (searchType) {
                case "movie":
                    endpoint = `http://127.0.0.1:5000/api/movie/suggestions?query=${searchQuery}`;
                    break;
                case "tv":
                    endpoint = `http://127.0.0.1:5000/api/tv/suggestions?query=${searchQuery}`;
                    break;
                case "book":
                    endpoint = `http://127.0.0.1:5000/api/book/suggestions?query=${searchQuery}`;
                    break;
                default:
                    endpoint = `http://127.0.0.1:5000/api/movie/suggestions?query=${searchQuery}`;
            }

            const response = await axios.get(endpoint);
            setSearchResults(response.data.suggestions || []);
        } catch (error) {
            console.error(`Error searching for ${searchType}:`, error);
        }
    };

    const addToCollage = (item) => {
        const emptyIndex = collageItems.findIndex(cell => cell === null);

        if (emptyIndex !== -1) {
            const newCollageItems = [...collageItems];
            newCollageItems[emptyIndex] = {
                id: item.id,
                title: item.title,
                poster: item.poster || item.poster_path || item.cover_url,
                type: searchType,
                rating: item.vote_average || item.rating || 0
            };

            setCollageItems(newCollageItems);
            showSnackbar(`Added ${item.title} to your collage`, "success");
        } else {
            showSnackbar("Collage is full! Remove an item first.", "warning");
        }
    };

    const removeFromCollage = (index) => {
        const newCollageItems = [...collageItems];
        newCollageItems[index] = null;
        setCollageItems(newCollageItems);
    };

    const handleDragStart = (index) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (index) => {
        setDropTargetIndex(index);
    };

    const handleDrop = () => {
        if (draggingIndex !== null && dropTargetIndex !== null) {
            const newCollageItems = [...collageItems];
            const draggedItem = newCollageItems[draggingIndex];

            newCollageItems[draggingIndex] = newCollageItems[dropTargetIndex];
            newCollageItems[dropTargetIndex] = draggedItem;

            setCollageItems(newCollageItems);
            setDraggingIndex(null);
            setDropTargetIndex(null);
        }
    };

    const saveCollage = async () => {
        if (!userData) {
            showSnackbar("Please log in to save collages", "error");
            return;
        }

        if (collageName.trim() === "") {
            showSnackbar("Please enter a name for your collage", "warning");
            return;
        }

        try {
            const payload = {
                username: userData.username,
                name: collageName,
                gridSize: gridSize,
                items: collageItems.filter(item => item !== null),
                showTitles: showTitles,
                exportFormat: exportFormat
            };

            if (isEditing && currentCollageId) {
                payload._id = currentCollageId;
            }

            const response = await axios.post(
                "http://127.0.0.1:5000/api/collages/save",
                payload,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.status === 200) {
                fetchSavedCollages(userData.username);
                setOpenSaveDialog(false);

                if (isEditing) {
                    showSnackbar("Collage updated successfully!", "success");
                } else {
                    showSnackbar("Collage saved successfully!", "success");
                    completeReset();
                }
            }
        } catch (error) {
            console.error("Error saving collage:", error);
            showSnackbar("Failed to save collage", "error");
        }
    };

    const getProxiedImageUrl = (url) => {
        // Check if it's an external image
        if (url && (url.includes('image.tmdb.org') || url.includes('http'))) {
            return `http://127.0.0.1:5000/api/proxy/image?url=${encodeURIComponent(url)}`;
        }
        return url;
    };

    const exportCollage = () => {
        if (collageRef.current) {
            const aspectRatio = rows / cols;
            const padding = 40;

            html2canvas(collageRef.current, {
                backgroundColor: '#fff',
                useCORS: true,
                allowTaint: false,
                width: collageRef.current.offsetWidth,
                height: collageRef.current.offsetWidth * aspectRatio + padding,
                scale: 2
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${collageName || "my-collage"}.${exportFormat}`;
                link.href = canvas.toDataURL(`image/${exportFormat}`);
                link.click();
                showSnackbar(`Exported collage as ${exportFormat.toUpperCase()}`, "success");
            }).catch(error => {
                console.error("Export error:", error);
                showSnackbar("Error exporting image. Please try again.", "error");
            });
        }
    };

    const exportSavedCollage = (collage) => {
        const format = collage.exportFormat || "png";

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        const cols = parseInt(collage.gridSize.split('x')[0]);
        const rows = parseInt(collage.gridSize.split('x')[1]);

        const containerDiv = document.createElement('div');
        containerDiv.style.width = '800px';
        containerDiv.style.backgroundColor = '#fff';
        containerDiv.style.padding = '20px';
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.alignItems = 'center';

        const titleDiv = document.createElement('h1');
        titleDiv.style.textAlign = 'center';
        titleDiv.style.margin = '0 0 20px 0';
        titleDiv.style.width = '100%';
        titleDiv.textContent = collage.name;
        containerDiv.appendChild(titleDiv);

        const gridDiv = document.createElement('div');
        gridDiv.style.display = 'grid';
        gridDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridDiv.style.gap = '8px';
        gridDiv.style.width = '100%';
        gridDiv.style.maxWidth = '760px';

        containerDiv.appendChild(gridDiv);
        tempDiv.appendChild(containerDiv);

        const imagePromises = [];
        const itemSize = Math.floor(760 / cols) - 8;

        collage.items.forEach((item, index) => {
            if (item) {
                const rowIndex = Math.floor(index / cols);
                const colIndex = index % cols;

                const itemDiv = document.createElement('div');
                itemDiv.style.width = `${itemSize}px`;
                itemDiv.style.height = `${itemSize}px`;
                itemDiv.style.position = 'relative';
                itemDiv.style.overflow = 'hidden';
                itemDiv.style.borderRadius = '2px';

                const img = document.createElement('img');
                img.crossOrigin = "anonymous";
                img.src = getProxiedImageUrl(item.poster);
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';

                const imgPromise = new Promise((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                    if (img.complete) resolve();
                });
                imagePromises.push(imgPromise);

                itemDiv.appendChild(img);

                if (collage.showTitles) {
                    const titleBar = document.createElement('div');
                    titleBar.style.position = 'absolute';
                    titleBar.style.bottom = '0';
                    titleBar.style.left = '0';
                    titleBar.style.right = '0';
                    titleBar.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    titleBar.style.color = 'white';
                    titleBar.style.padding = '4px';
                    titleBar.style.fontSize = '12px';
                    titleBar.style.textAlign = 'center';
                    titleBar.textContent = item.title;

                    itemDiv.appendChild(titleBar);
                }

                gridDiv.appendChild(itemDiv);
            }
        });

        Promise.all(imagePromises).then(() => {
            const totalHeight = containerDiv.scrollHeight;

            html2canvas(containerDiv, {
                backgroundColor: '#fff',
                useCORS: true,
                allowTaint: false,
                width: 800,
                height: totalHeight + 40,
                scale: 2
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${collage.name}.${format}`;
                link.href = canvas.toDataURL(`image/${format}`);
                link.click();

                document.body.removeChild(tempDiv);
                showSnackbar(`Exported collage as ${format.toUpperCase()}`, "success");
            }).catch(error => {
                console.error("Export error:", error);
                showSnackbar("Error exporting collage. Please try again.", "error");
                document.body.removeChild(tempDiv);
            });
        });
    };

    const handleGridSizeChange = (newSize) => {
        setGridSize(newSize);
    };

    const completeReset = () => {
        setIsEditing(false);
        setCurrentCollageId(null);
        setCollageName("");
        setGridSize("3x3");
        setShowTitles(false);
        setExportFormat("png");
        setCollageItems(Array(3 * 3).fill(null));
    };

    const resetCollage = () => {
        if (isEditing) {
            completeReset();
        }
    };

    const loadCollage = (collage) => {
        setIsEditing(true);
        setCurrentCollageId(collage._id);

        const newGridSize = collage.gridSize;
        const { rows, cols } = gridDimensions[newGridSize];
        const totalCells = rows * cols;

        const newItems = Array(totalCells).fill(null);

        if (collage.items && collage.items.length > 0) {
            collage.items.forEach((item, index) => {
                if (index < totalCells && item) {
                    newItems[index] = {
                        id: item.id,
                        title: item.title,
                        poster: item.poster,
                        type: item.type || "movie",
                        rating: item.rating || 0
                    };
                }
            });
        }

        setCollageItems(newItems);

        setGridSize(newGridSize);
        setCollageName(collage.name);
        setShowTitles(collage.showTitles || false);
        setExportFormat(collage.exportFormat || "png");

        setCurrentTab(0);
        showSnackbar(`Editing collage: ${collage.name}`, "info");
    };

    const deleteCollage = async (collageId) => {
        try {
            await axios.delete(
                `http://127.0.0.1:5000/api/collages/${collageId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            fetchSavedCollages(userData.username);
            showSnackbar("Collage deleted", "success");
        } catch (error) {
            console.error("Error deleting collage:", error);
            showSnackbar("Failed to delete collage", "error");
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        if (newValue === 0 && !isEditing) {
            resetCollage();
        } else if (newValue === 1) {
            completeReset();
        }
    };

    const showSnackbar = (message, severity = "info") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const renderGridCell = (item, index) => {
        const isDragging = index === draggingIndex;
        const isDropTarget = index === dropTargetIndex;

        return (
            <Box
                key={index}
                sx={{
                    width: "100%",
                    paddingTop: "100%",
                    position: "relative",
                    border: "1px dashed #ccc",
                    borderRadius: "4px",
                    backgroundColor: isDropTarget ? "rgba(0,0,0,0.05)" : "transparent",
                    opacity: isDragging ? 0.5 : 1,
                    cursor: item ? "grab" : "default",
                    transition: "all 0.2s ease"
                }}
                draggable={!!item}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => {
                    e.preventDefault();
                    handleDragOver(index);
                }}
                onDrop={handleDrop}
                onDragEnd={() => {
                    setDraggingIndex(null);
                    setDropTargetIndex(null);
                }}
            >
                {item ? (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            overflow: "hidden"
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                position: "relative",
                                "&:hover .remove-button": {
                                    opacity: 1
                                }
                            }}
                        >
                            <img
                                src={getProxiedImageUrl(item.poster)}
                                alt={item.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    position: "absolute"
                                }}
                            />
                            <IconButton
                                className="remove-button"
                                onClick={() => removeFromCollage(index)}
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    backgroundColor: "rgba(255,255,255,0.7)",
                                    opacity: 0,
                                    transition: "opacity 0.2s"
                                }}
                                size="small"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                            {showTitles && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: "rgba(0,0,0,0.7)",
                                        padding: "4px",
                                        color: "white",
                                        fontSize: "10px",
                                        textAlign: "center",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    {item.title}
                                    {item.rating > 0 && ` (${item.rating.toFixed(1)})`}
                                </Box>
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#ccc"
                        }}
                    >
                        +
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ paddingTop: 10 }}>
            <Navbar userData={userData} />

            <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                    Collage Creator
                </Typography>

                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    sx={{ mb: 3 }}
                >
                    <Tab label={isEditing ? `Editing: ${collageName}` : "Create"} />
                    <Tab label="My Collages" />
                </Tabs>

                {currentTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography variant="h6">Your Collage</Typography>
                                    <Box>
                                        <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
                                            <InputLabel>Grid Size</InputLabel>
                                            <Select
                                                value={gridSize}
                                                onChange={(e) => handleGridSizeChange(e.target.value)}
                                                label="Grid Size"
                                            >
                                                <MenuItem value="3x3">3x3</MenuItem>
                                                <MenuItem value="4x4">4x4</MenuItem>
                                                <MenuItem value="5x5">5x5</MenuItem>
                                            </Select>
                                        </FormControl>
                                        {isEditing && (
                                            <Button
                                                variant="outlined"
                                                onClick={resetCollage}
                                                sx={{ mr: 1 }}
                                            >
                                                New Collage
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            startIcon={<SaveIcon />}
                                            onClick={() => setOpenSaveDialog(true)}
                                            sx={{ mr: 1 }}
                                        >
                                            Save
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            startIcon={<CloudDownloadIcon />}
                                            onClick={exportCollage}
                                        >
                                            Export
                                        </Button>
                                    </Box>
                                </Box>

                                <Box
                                    ref={collageRef}
                                    sx={{
                                        backgroundColor: "#fff",
                                        p: 2,
                                        borderRadius: "4px"
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}
                                    >
                                        {collageName || "My Collage"}
                                    </Typography>

                                    <Grid container spacing={1}>
                                        {collageItems.map((item, index) => (
                                            <Grid item xs={12 / cols} key={index}>
                                                {renderGridCell(item, index)}
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Add Media
                                </Typography>

                                <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                                    <InputLabel>Media Type</InputLabel>
                                    <Select
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value)}
                                        label="Media Type"
                                    >
                                        <MenuItem value="movie">Movies</MenuItem>
                                        <MenuItem value="tv">TV Shows</MenuItem>
                                        <MenuItem value="book">Books</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    label="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleSearch} edge="end">
                                                    <SearchIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                <List
                                    sx={{
                                        maxHeight: "400px",
                                        overflow: "auto",
                                        border: "1px solid #eee",
                                        borderRadius: "4px"
                                    }}
                                >
                                    {searchResults.map((result) => (
                                        <React.Fragment key={result.id}>
                                            <ListItem
                                                button
                                                onClick={() => addToCollage(result)}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={result.poster || result.poster_path || result.cover_url}
                                                        variant="rounded"
                                                        sx={{ width: 56, height: 56 }}
                                                    >
                                                        {searchType === "movie" ? <MovieIcon /> :
                                                            searchType === "tv" ? <TvIcon /> : <BookIcon />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={result.title}
                                                    secondary={
                                                        searchType === "book"
                                                            ? result.author
                                                            : result.release_date && new Date(result.release_date).getFullYear()
                                                    }
                                                />
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    ))}

                                    {searchResults.length === 0 && (
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    searchQuery
                                                        ? "No results found"
                                                        : "Search for media to add to your collage"
                                                }
                                                sx={{ textAlign: "center", color: "#999" }}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {currentTab === 1 && (
                    <Grid container spacing={3}>
                        {savedCollages.length > 0 ? (
                            savedCollages.map((collage) => (
                                <Grid item xs={12} sm={6} md={4} key={collage._id}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            transition: "transform 0.2s, box-shadow 0.2s",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                            }
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {collage.name}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {collage.gridSize} grid • {collage.items.filter(Boolean).length} items
                                        </Typography>

                                        <Box
                                            sx={{
                                                flex: 1,
                                                display: "grid",
                                                gridTemplateColumns: `repeat(${collage.gridSize.split("x")[0]}, 1fr)`,
                                                gridTemplateRows: `repeat(${collage.gridSize.split("x")[1]}, 1fr)`,
                                                gap: "4px",
                                                mb: 2
                                            }}
                                        >
                                            {collage.items.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        paddingTop: "100%",
                                                        position: "relative",
                                                        backgroundColor: "#f5f5f5",
                                                        borderRadius: "2px",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    {item && (
                                                        <img
                                                            src={getProxiedImageUrl(item.poster)}
                                                            alt={item.title}
                                                            style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                            <Button
                                                startIcon={<EditIcon />}
                                                size="small"
                                                onClick={() => loadCollage(collage)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                startIcon={<CloudDownloadIcon />}
                                                size="small"
                                                onClick={() => exportSavedCollage(collage)}
                                            >
                                                Export
                                            </Button>
                                            <Button
                                                startIcon={<DeleteIcon />}
                                                size="small"
                                                color="error"
                                                onClick={() => deleteCollage(collage._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: "center" }}>
                                    <Typography variant="h6" color="text.secondary">
                                        You haven't created any collages yet
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => setCurrentTab(0)}
                                        sx={{ mt: 2 }}
                                    >
                                        Create Your First Collage
                                    </Button>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>

            <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
                <DialogTitle>
                    {isEditing ? "Update Your Collage" : "Save Your Collage"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Collage Name"
                        fullWidth
                        variant="outlined"
                        value={collageName}
                        onChange={(e) => setCollageName(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showTitles}
                                onChange={(e) => setShowTitles(e.target.checked)}
                            />
                        }
                        label="Show titles on export"
                    />

                    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                        <InputLabel>Export Format</InputLabel>
                        <Select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            label="Export Format"
                        >
                            <MenuItem value="png">PNG</MenuItem>
                            <MenuItem value="jpeg">JPEG</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
                    <Button onClick={saveCollage} variant="contained">
                        {isEditing ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CollageCreator;