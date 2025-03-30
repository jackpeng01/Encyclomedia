import React, { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Menu,
    MenuItem
} from "@mui/material";
import { Add as AddIcon, Sort as SortIcon } from "@mui/icons-material";
import ListDetailsPopup from "./ListDetailsPopup";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { getUserByToken } from "../api/users.js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const LocalListsPage = () => {
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const [userData, setUserData] = useState({});

    const [lists, setLists] = useState([]);
    const [displayedLists, setDisplayedLists] = useState([]);
    const [sortMethod, setSortMethod] = useState(() => {
        return localStorage.getItem('listsSortMethod') || "default";
    });

    const [sortAnchorEl, setSortAnchorEl] = useState(null);

    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListDescription, setNewListDescription] = useState("");

    const [openRenameDialog, setOpenRenameDialog] = useState(false);
    const [renameListId, setRenameListId] = useState(null);
    const [renameListName, setRenameListName] = useState("");
    const [renameListDescription, setRenameListDescription] = useState("");

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteListId, setDeleteListId] = useState(null);

    const [contextMenu, setContextMenu] = useState(null);
    const [selectedListId, setSelectedListId] = useState(null);

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

    // Load lists from localStorage on component mount
    useEffect(() => {
        const savedLists = localStorage.getItem('lists');
        if (savedLists) {
            const parsedLists = JSON.parse(savedLists);
            setLists(parsedLists);
        }
    }, []);

    // Save lists to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('lists', JSON.stringify(lists));
    }, [lists]);

    // Apply sort method whenever lists or sort method change
    useEffect(() => {
        sortLists(sortMethod);
        // Save sort method to localStorage
        localStorage.setItem('listsSortMethod', sortMethod);
    }, [lists, sortMethod]);

    // Handle drag end for lists
    const handleDragEnd = (result) => {
        // Dropped outside the droppable area
        if (!result.destination) return;

        const reorderedLists = Array.from(displayedLists);
        const [reorderedItem] = reorderedLists.splice(result.source.index, 1);
        reorderedLists.splice(result.destination.index, 0, reorderedItem);

        setDisplayedLists(reorderedLists);

        // If in manual sort mode, save this order
        if (sortMethod === 'manual') {
            saveManualOrder(reorderedLists.map(list => list.id));
        }
    };

    // Sort lists according to selected method
    const sortLists = (method) => {
        let sortedLists = [...lists];

        switch (method) {
            case "alphabetical":
                sortedLists.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "date":
                sortedLists.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA; // newest first
                });
                break;
            case "manual":
                // For manual sorting, use the order as saved
                const manualOrder = JSON.parse(localStorage.getItem('listsManualOrder') || '[]');
                if (manualOrder.length > 0) {
                    // Create a map for quick lookup of order positions
                    const orderMap = new Map(manualOrder.map((id, index) => [id, index]));

                    // Sort based on the manual order
                    sortedLists.sort((a, b) => {
                        const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
                        const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
                        return orderA - orderB;
                    });
                }
                break;
            default:
                // Default order is by creation date (newest first)
                sortedLists.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA;
                });
        }

        setDisplayedLists(sortedLists);
    };

    // Save manual order when lists are reordered
    const saveManualOrder = (orderedIds) => {
        localStorage.setItem('listsManualOrder', JSON.stringify(orderedIds));
    };

    // Handle sort button click
    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    // Handle closing sort menu
    const handleCloseSortMenu = () => {
        setSortAnchorEl(null);
    };

    // Handle selecting sort method
    const handleSortMethodSelect = (method) => {
        setSortMethod(method);
        handleCloseSortMenu();
    };

    // Handle context menu open
    const handleContextMenu = (event, listId) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null
        );
        setSelectedListId(listId);
    };

    // Handle context menu close
    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    // Handle creating a new list
    const handleCreateList = () => {
        const newList = {
            id: Date.now().toString(), // Simple unique ID
            name: newListName,
            description: newListDescription,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log("Creating new list:", newList);
        const updatedLists = [...lists, newList];
        console.log("Updated lists array:", updatedLists);
        setLists(updatedLists);
        setOpenCreateDialog(false);
        setNewListName("");
        setNewListDescription("");
    };

    // Handle opening rename dialog
    const handleOpenRenameDialog = () => {
        const list = lists.find(list => list.id === selectedListId);
        if (list) {
            setRenameListId(selectedListId);
            setRenameListName(list.name);
            setRenameListDescription(list.description || "");
            setOpenRenameDialog(true);
        }
        handleCloseContextMenu();
    };

    // Handle renaming a list
    const handleRenameList = () => {
        setLists(lists.map(list => {
            if (list.id === renameListId) {
                return {
                    ...list,
                    name: renameListName,
                    description: renameListDescription,
                    updatedAt: new Date().toISOString()
                };
            }
            return list;
        }));

        setOpenRenameDialog(false);
    };

    // Handle opening delete dialog
    const handleOpenDeleteDialog = () => {
        setDeleteListId(selectedListId);
        setOpenDeleteDialog(true);
        handleCloseContextMenu();
    };

    // Handle deleting a list
    const handleDeleteList = () => {
        setLists(lists.filter(list => list.id !== deleteListId));
        setOpenDeleteDialog(false);
    };

    // Handle duplicating a list
    const handleDuplicateList = () => {
        const listToDuplicate = lists.find(list => list.id === selectedListId);
        if (listToDuplicate) {
            const duplicatedList = {
                ...listToDuplicate,
                id: Date.now().toString(),
                name: `${listToDuplicate.name} (Copy)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            setLists([...lists, duplicatedList]);
        }
        handleCloseContextMenu();
    };

    // Handle clicking on a list card
    const handleListClick = (listId) => {
        const list = lists.find(list => list.id === listId);
        if (list) {
            setSelectedList(list);
            setListDetailsOpen(true);
        }
    };

    // Handle updating a list (used by ListDetailsPopup)
    const handleUpdateList = (updatedList) => {
        setLists(lists.map(list =>
            list.id === updatedList.id ? updatedList : list
        ));

        // Update selected list in state
        setSelectedList(updatedList);
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
                {/* Header with title, sort button, and create button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">
                        Your Lists (Local)
                    </Typography>
                    <Box>
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
                                Alphabetical (A-Z)
                            </MenuItem>
                            <MenuItem
                                onClick={() => handleSortMethodSelect('date')}
                                selected={sortMethod === 'date'}
                            >
                                Date Added (Newest first)
                            </MenuItem>
                            <MenuItem
                                onClick={() => handleSortMethodSelect('manual')}
                                selected={sortMethod === 'manual'}
                            >
                                Manual Order
                            </MenuItem>
                        </Menu>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCreateDialog(true)}
                        >
                            Create New List
                        </Button>
                    </Box>
                </Box>

                {/* Lists Grid with native drag-drop */}
                <Grid container spacing={3}>
                    {displayedLists.map((list, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={list.id}>
                            <div
                                draggable={sortMethod === 'manual'}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', index.toString());
                                    e.currentTarget.style.opacity = '0.5';
                                }}
                                onDragEnd={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'));
                                    if (draggedIdx !== index) {
                                        const newLists = [...displayedLists];
                                        const movedItem = newLists[draggedIdx];
                                        newLists.splice(draggedIdx, 1);
                                        newLists.splice(index, 0, movedItem);
                                        setDisplayedLists(newLists);
                                        saveManualOrder(newLists.map(list => list.id));
                                    }
                                }}
                            >
                                <Card
                                    onClick={() => handleListClick(list.id)}
                                    onContextMenu={(e) => handleContextMenu(e, list.id)}
                                    sx={{
                                        cursor: sortMethod === 'manual' ? 'grab' : 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" noWrap>
                                            {list.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {list.description || "No description"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {list.items ? `${list.items.length} items` : "0 items"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        </Grid>
                    ))}
                    {displayedLists.length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="text.secondary" textAlign="center">
                                No lists created yet. Create your first list to get started!
                            </Typography>
                        </Grid>
                    )}
                </Grid>

                {/* Context Menu */}
                <Menu
                    open={contextMenu !== null}
                    onClose={handleCloseContextMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                >
                    <MenuItem onClick={handleOpenRenameDialog}>Rename</MenuItem>
                    <MenuItem onClick={handleDuplicateList}>Duplicate</MenuItem>
                    <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>Delete</MenuItem>
                </Menu>

                {/* Create List Dialog */}
                <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Create New List</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="List Name"
                            fullWidth
                            variant="outlined"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Description (Optional)"
                            fullWidth
                            variant="outlined"
                            value={newListDescription}
                            onChange={(e) => setNewListDescription(e.target.value)}
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreateList}
                            variant="contained"
                            disabled={!newListName.trim()}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Rename Dialog */}
                <Dialog open={openRenameDialog} onClose={() => setOpenRenameDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Rename List</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="List Name"
                            fullWidth
                            variant="outlined"
                            value={renameListName}
                            onChange={(e) => setRenameListName(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Description (Optional)"
                            fullWidth
                            variant="outlined"
                            value={renameListDescription}
                            onChange={(e) => setRenameListDescription(e.target.value)}
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenRenameDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleRenameList}
                            variant="contained"
                            disabled={!renameListName.trim()}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                    <DialogTitle>Delete List</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this list? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                        <Button onClick={handleDeleteList} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* List Details Popup */}
                {selectedList && (
                    <ListDetailsPopup
                        open={listDetailsOpen}
                        list={selectedList}
                        onClose={() => setListDetailsOpen(false)}
                        onUpdateList={handleUpdateList}
                    />
                )}
            </Box>
        </Box>
    );
};

export default LocalListsPage;