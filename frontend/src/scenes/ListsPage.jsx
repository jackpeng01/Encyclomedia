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
import { Add as AddIcon, Sort as SortIcon } from "@mui/icons-material";
import {getLists, createList, updateList, deleteList } from "../api/listsService.js";
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
      const fetchedLists = await getLists();
      setLists(fetchedLists);
    };
    loadLists();
  }, []);

  // Apply sort method whenever lists or sort method change
  useEffect(() => {
    sortLists(sortMethod);
    // Save sort method to localStorage
    localStorage.setItem('listsSortMethod', sortMethod);
  }, [lists, sortMethod]);

  // Sort lists according to selected method
  const sortLists = (method) => {
    let sortedLists = [...lists];
    
    switch (method) {
      case "alphabetical":
        sortedLists.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        sortedLists.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA; // newest first
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
    setSortMethod(method);
    handleCloseSortMenu();
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

      await createList(newList);

      setOpenCreateDialog(false);
      setNewListName("");
      setNewListDescription("");
      
      const updatedLists = await getLists();
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
      });

      setOpenRenameDialog(false);
      
      const updatedLists = await getLists();
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
      await deleteList(deleteListId);

      setOpenDeleteDialog(false);
      
      const updatedLists = await getLists();
      setLists(updatedLists);
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

        await createList(duplicatedList);
        
        const updatedLists = await getLists();
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
      await updateList(updatedList._id, updatedList);
      
      const updatedLists = await getLists();
      setLists(updatedLists);
      
      setSelectedList(updatedList);
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
        
        {/* Lists Grid */}
        <Grid container spacing={3}>
          {displayedLists.map((list, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={list._id}>
              <Card 
                onClick={() => handleListClick(list._id)}
                onContextMenu={(e) => handleContextMenu(e, list._id)}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  },
                  position: 'relative'
                }}
              >
                {sortMethod === 'manual' && (
                  <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
                    <IconButton
                      size="small"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveListUp(index);
                      }}
                      sx={{ bgcolor: 'background.paper', mr: 0.5 }}
                    >
                      ↑
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={index === displayedLists.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveListDown(index);
                      }}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      ↓
                    </IconButton>
                  </Box>
                )}
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

export default ListsPage;