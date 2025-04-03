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
  MenuItem,
  IconButton
} from "@mui/material";
import { Add as AddIcon, Sort as SortIcon, Public as PublicIcon, Bookmark as BookmarkIcon } from "@mui/icons-material";
import { getLists, createList, updateList, deleteList } from "../api/listsService.js";
import ListDetailsPopup from "./ListDetailsPopup";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { getUserByToken } from "../api/users.js";

const ListsPage = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState({});

  const [lists, setLists] = useState([]);
  const [displayedLists, setDisplayedLists] = useState([]);
  const [sortMethod, setSortMethod] = useState(() => {
    return localStorage.getItem('listsSortMethod') || "default";
  });

  // Track sort direction (ascending or descending)
  const [sortDirection, setSortDirection] = useState(() => {
    return localStorage.getItem('listsSortDirection') || "desc";
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

  // Fetch all lists on component mount
  useEffect(() => {
    const loadLists = async () => {
      console.log("token line 70: ", token)
      const fetchedLists = await getLists(token);
      setLists(fetchedLists);
    };
    loadLists();
  }, []);

  // Apply sort method whenever lists, sort method, or direction change
  useEffect(() => {
    sortLists(sortMethod, sortDirection);
    // Save sort method and direction to localStorage
    localStorage.setItem('listsSortMethod', sortMethod);
    localStorage.setItem('listsSortDirection', sortDirection);
  }, [lists, sortMethod, sortDirection]);

  // Sort lists according to selected method and direction
  const sortLists = (method, direction) => {
    let sortedLists = [...lists];
    const isAscending = direction === "asc";

    switch (method) {
      case "alphabetical":
        sortedLists.sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return isAscending ? comparison : -comparison;
        });
        break;
      case "date":
        sortedLists.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return isAscending ? dateA - dateB : dateB - dateA;
        });
        break;
      case "manual":
        // For manual sorting, use the order as saved
        const manualOrder = JSON.parse(localStorage.getItem('listsManualOrder') || '[]');
        if (manualOrder.length > 0) {
          const orderMap = new Map(manualOrder.map((id, index) => [id, index]));

          // Sort based on the manual order
          sortedLists.sort((a, b) => {
            const orderA = orderMap.has(a._id) ? orderMap.get(a._id) : Number.MAX_SAFE_INTEGER;
            const orderB = orderMap.has(b._id) ? orderMap.get(b._id) : Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
        }
        break;
      default:
        // Default order is by creation date (newest first)
        sortedLists.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA;
        });
    }

    setDisplayedLists(sortedLists);
  };

  const saveManualOrder = (orderedIds) => {
    localStorage.setItem('listsManualOrder', JSON.stringify(orderedIds));
  };

  const handleMoveListUp = (index) => {
    if (index <= 0 || sortMethod !== 'manual') return;

    const newDisplayedLists = [...displayedLists];
    const temp = newDisplayedLists[index];
    newDisplayedLists[index] = newDisplayedLists[index - 1];
    newDisplayedLists[index - 1] = temp;

    setDisplayedLists(newDisplayedLists);
    saveManualOrder(newDisplayedLists.map(list => list._id));
  };

  const handleMoveListDown = (index) => {
    if (index >= displayedLists.length - 1 || sortMethod !== 'manual') return;

    const newDisplayedLists = [...displayedLists];
    const temp = newDisplayedLists[index];
    newDisplayedLists[index] = newDisplayedLists[index + 1];
    newDisplayedLists[index + 1] = temp;

    setDisplayedLists(newDisplayedLists);
    saveManualOrder(newDisplayedLists.map(list => list._id));
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortAnchorEl(null);
  };

  const handleSortMethodSelect = (method) => {
    if (method === sortMethod && (method === "alphabetical" || method === "date")) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      if (method === "alphabetical") {
        setSortDirection("asc"); // A to Z by default
      } else if (method === "date") {
        setSortDirection("desc"); // Newest first by default
      }
      setSortMethod(method);
    }

    handleCloseSortMenu();

    // If switching to manual sort, initialize the manual order with current display order
    if (method === 'manual') {
      saveManualOrder(displayedLists.map(list => list._id));
    }
  };

  const handleContextMenu = (event, listId) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null
    );
    setSelectedListId(listId);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateList = async () => {
    try {
      const newList = {
        name: newListName,
        description: newListDescription,
        items: []
      };

      await createList(newList, token);

      setOpenCreateDialog(false);
      setNewListName("");
      setNewListDescription("");

      const updatedLists = await getLists(token);
      setLists(updatedLists);
    } catch (error) {
      console.error("❌ Error creating list:", error);
    }
  };

  const handleOpenRenameDialog = () => {
    const list = lists.find(list => list._id === selectedListId);
    if (list) {
      setRenameListId(selectedListId);
      setRenameListName(list.name);
      setRenameListDescription(list.description || "");
      setOpenRenameDialog(true);
    }
    handleCloseContextMenu();
  };

  const handleRenameList = async () => {
    try {
      await updateList(renameListId, {
        name: renameListName,
        description: renameListDescription
      }, token);

      setOpenRenameDialog(false);

      const updatedLists = await getLists(token);
      setLists(updatedLists);
    } catch (error) {
      console.error("❌ Error renaming list:", error);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteListId(selectedListId);
    setOpenDeleteDialog(true);
    handleCloseContextMenu();
  };

  const handleDeleteList = async () => {
    try {
      await deleteList(deleteListId, token);

      setOpenDeleteDialog(false);

      const updatedLists = await getLists(token);
      setLists(updatedLists);

      if (sortMethod === 'manual') {
        const currentManualOrder = JSON.parse(localStorage.getItem('listsManualOrder') || '[]');
        const updatedManualOrder = currentManualOrder.filter(id => id !== deleteListId);
        saveManualOrder(updatedManualOrder);
      }
    } catch (error) {
      console.error("❌ Error deleting list:", error);
    }
  };

  const handleDuplicateList = async () => {
    try {
      const listToDuplicate = lists.find(list => list._id === selectedListId);
      if (listToDuplicate) {
        const duplicatedList = {
          name: `${listToDuplicate.name} (Copy)`,
          description: listToDuplicate.description,
          items: listToDuplicate.items
        };

        await createList(duplicatedList, token);

        const updatedLists = await getLists(token);
        setLists(updatedLists);
      }
    } catch (error) {
      console.error("❌ Error duplicating list:", error);
    }
    handleCloseContextMenu();
  };

  const handleListClick = (listId) => {
    const list = lists.find(list => list._id === listId);
    if (list) {
      setSelectedList(list);
      setListDetailsOpen(true);
    }
  };

  const handleUpdateList = async (updatedList) => {
    try {
      await updateList(updatedList._id, updatedList, token);

      const updatedLists = await getLists(token);
      setLists(updatedLists);

      const refreshedList = updatedLists.find(list => list._id === updatedList._id);
      setSelectedList(refreshedList);
    } catch (error) {
      console.error("❌ Error updating list:", error);
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
        {/* Header with title, sort button, and create button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Your Lists
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
                Alphabetical {sortMethod === 'alphabetical' && (sortDirection === 'asc' ? '(A to Z)' : '(Z to A)')}
              </MenuItem>
              <MenuItem
                onClick={() => handleSortMethodSelect('date')}
                selected={sortMethod === 'date'}
              >
                Date Added {sortMethod === 'date' && (sortDirection === 'desc' ? '(Newest first)' : '(Oldest first)')}
              </MenuItem>
              <MenuItem
                onClick={() => handleSortMethodSelect('manual')}
                selected={sortMethod === 'manual'}
              >
                Manual Order
              </MenuItem>
            </Menu>
            <Button
              variant="outlined"
              startIcon={<BookmarkIcon />} // Import this icon
              onClick={() => navigate("/followed-lists")}
              sx={{ mr: 2 }}
            >
              Followed Lists
            </Button>
            <Button
              variant="outlined"
              startIcon={<PublicIcon />}
              onClick={() => navigate("/public-lists")}
              sx={{ mr: 2 }}
            >
              Discover Lists
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create New List
            </Button>
          </Box>
        </Box>

        {/* Lists Grid */}
        <Grid container spacing={3}>
          {displayedLists.map((list, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={list._id}>
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
                    saveManualOrder(newLists.map(list => list._id));
                  }
                }}
              >
                <Card
                  onClick={() => handleListClick(list._id)}
                  onContextMenu={(e) => handleContextMenu(e, list._id)}
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
            userData={userData}
            onClose={() => {
              setListDetailsOpen(false);
              const reloadLists = async () => {
                const refreshedLists = await getLists(token);
                setLists(refreshedLists);
              };
              reloadLists();
            }}
            onUpdateList={handleUpdateList}
          />
        )}
      </Box>
    </Box>
  );
};

export default ListsPage;