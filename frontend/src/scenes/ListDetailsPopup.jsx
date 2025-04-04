import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Dialog as ConfirmDialog,
  DialogActions,
  DialogContent as ConfirmDialogContent,
  DialogContentText,
  DialogTitle as ConfirmDialogTitle
} from "@mui/material";
import {
  Public as PublicIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { followList, unfollowList } from "../api/listsService";
import { Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";

const TMDB_API_KEY = 'a9302b42220aa7e2d0d7ce9d9e988203';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const ListDetailsPopup = ({ open, list, userData, onClose, onUpdateList }) => {
  const [followerCount, setFollowerCount] = useState(list?.follower_count || 0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [showAddDescription, setShowAddDescription] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaTypeMenu, setMediaTypeMenu] = useState(null);
  const [items, setItems] = useState([]);
  const [listModified, setListModified] = useState(false);
  const [isPublic, setIsPublic] = useState(list?.isPublic || false);
  const [isCollaborative, setIsCollaborative] = useState(list?.isCollaborative || false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [collaborators, setCollaborators] = useState(list?.collaborators || []);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null
  });

  useEffect(() => {
    if (list && userData) {
      setIsOwner(list.user_id === userData.username);
      setIsCollaborator(list.collaborators?.includes(userData.username));
      const followedLists = userData.followed_lists || [];
      setIsFollowing(followedLists.includes(list._id));
    }
  }, [list, userData]);

  const handleFollowToggle = async () => {
    if (!userData) return;

    try {
      if (isFollowing) {
        await unfollowList(list._id, token);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await followList(list._id, token);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      setError(isFollowing ? "Failed to unfollow list" : "Failed to follow list");
      console.error(error);
    }
  };

  useEffect(() => {
    if (list) {
      setItems(list.items || []);
      setEditedDescription(list.description || "");
      setIsPublic(list.isPublic || false);
      setIsCollaborative(list.isCollaborative || false);
      setCollaborators(list.collaborators || []);
      setListModified(false);
    }
  }, [list]);

  const handleAddClick = (event) => {
    setMediaTypeMenu(event.currentTarget);
  };

  const handleCloseMediaMenu = () => {
    setMediaTypeMenu(null);
  };

  const handleMediaTypeSelect = (type) => {
    setSearchType(type);
    setSearchOpen(true);
    setSearchQuery('');
    setSearchResults([]);
    handleCloseMediaMenu();
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Only allow owners and collaborators to reorder items
    if (!isOwner && !(list.isCollaborative && list.collaborators?.includes(userData?._id))) {
      setError("You don't have permission to modify this list");
      return;
    }

    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setItems(reorderedItems);
    setListModified(true);
  };

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setEditedDescription(list.description || "");
      setShowAddDescription(false);
    } else {
      if (listModified) {
        setItems(list.items || []);
        setListModified(false);
      }
      setShowAddDescription(false);
    }
  };

  const handleAddDescriptionClick = () => {
    setShowAddDescription(!showAddDescription);
  };

  const handleSaveChanges = () => {
    const updatedList = {
      ...list,
      description: editedDescription,
      items: items,
      ...(isOwner && {
        isPublic: isPublic,
        isCollaborative: isCollaborative,
        collaborators: collaborators,
      }),
      updatedAt: new Date().toISOString()
    };

    onUpdateList(updatedList);
    setIsEditMode(false);
    setShowAddDescription(false);
    setShowCollaborators(false);
    setListModified(false);
  };

  const handleRemoveItem = (index) => {
    if (!isOwner && !isCollaborator) {
      setError("You don't have permission to modify this list");
      return;
    }

    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    setListModified(true);
  };

  const handleClosePopup = () => {
    if (isEditMode && listModified) {
      setIsEditMode(false);
    }
    onClose();
  };

  useEffect(() => {
    if (!searchQuery.trim() || !searchOpen || !searchType) return;

    const searchTimeout = setTimeout(() => {
      const fetchSearchResults = async () => {
        setIsLoading(true);
        setError(null);

        try {
          let results = [];

          if (searchType === 'movie') {
            const response = await fetch(
              `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            results = data.results.map(movie => ({
              id: `movie-${movie.id}`,
              title: movie.title,
              type: 'movie',
              year: movie.release_date ? new Date(movie.release_date).getFullYear() : '',
              image: movie.poster_path
                ? `${TMDB_IMG_BASE}${movie.poster_path}`
                : '/api/placeholder/150/225'
            }));
          }
          else if (searchType === 'tv') {
            const response = await fetch(
              `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            results = data.results.map(show => ({
              id: `tv-${show.id}`,
              title: show.name,
              type: 'tv',
              year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : '',
              image: show.poster_path
                ? `${TMDB_IMG_BASE}${show.poster_path}`
                : '/api/placeholder/150/225'
            }));
          }
          else if (searchType === 'book') {
            const response = await fetch(
              `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=10`
            );
            const data = await response.json();
            results = data.docs.map(book => ({
              id: `book-${book.key.replace('/works/', '')}`,
              title: book.title,
              type: 'book',
              year: book.first_publish_year || '',
              image: book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : '/api/placeholder/150/225'
            }));
          }

          setSearchResults(results);
        } catch (err) {
          console.error('Search error:', err);
          setError(`Failed to search for ${searchType}s. Please try again.`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSearchResults();
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, searchType, searchOpen]);

  const handleAddMedia = (item) => {
    try {
      const updatedItems = [...items, item];
      setItems(updatedItems);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setListModified(true);

      if (!isEditMode) {
        const updatedList = {
          ...list,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
        onUpdateList(updatedList);
      }
    } catch (err) {
      setError(`Failed to add item to list: ${err.message}`);
    }
  };

  const handleVisibilityChange = () => {
    setConfirmDialog({
      open: true,
      title: isPublic ? "Make List Private?" : "Make List Public?",
      message: isPublic
        ? "Making this list private will hide it from other users. Continue?"
        : "Making this list public will allow other users to view it. Continue?",
      onConfirm: () => {
        setIsPublic(!isPublic);
        setListModified(true);
        setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
      }
    });
  };

  const handleCollaborationChange = () => {
    setConfirmDialog({
      open: true,
      title: isCollaborative ? "Disable Collaboration?" : "Enable Collaboration?",
      message: isCollaborative
        ? "Disabling collaboration will prevent others from contributing to this list. Continue?"
        : "Enabling collaboration will allow other users to contribute to this list if you add them as collaborators. Continue?",
      onConfirm: () => {
        setIsCollaborative(!isCollaborative);
        setListModified(true);
        setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
      }
    });
  };

  const handleAddCollaborator = async () => {
    if (!newCollaborator.trim()) return;
    setIsLoading(true);
    try {
      // Check if user exists in database
      const response = await fetch(`/api/users/${newCollaborator}`);

      if (response.ok) {
        if (!collaborators.includes(newCollaborator)) {
          setCollaborators([...collaborators, newCollaborator]);
          setListModified(true);
        } else {
          setError("This user is already a collaborator");
        }
      } else {
        setError("User not found. Please check the username.");
      }
    } catch (err) {
      setError(`Failed to verify user: ${err.message}`);
    } finally {
      setIsLoading(false);
      setNewCollaborator("");
    }
  };

  const handleRemoveCollaborator = (username) => {
    setConfirmDialog({
      open: true,
      title: "Remove Collaborator",
      message: `Are you sure you want to remove ${username} as a collaborator?`,
      onConfirm: () => {
        const updatedCollaborators = collaborators.filter(c => c !== username);
        setCollaborators(updatedCollaborators);
        setListModified(true);
        setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
      }
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
  };

  return (

    <Dialog
      open={open}
      onClose={isEditMode && listModified ? null : handleClosePopup}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {list?.name}
          </Typography>
          <Box>
            {isOwner ? (
              // Show edit controls for owner
              isEditMode ? (
                <>
                  <Button startIcon={<SaveIcon />} variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mr: 1 }}>
                    Save
                  </Button>
                  <IconButton onClick={handleEditMode}>
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton onClick={handleEditMode} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleClosePopup}>
                    <CloseIcon />
                  </IconButton>
                </>
              )
            ) : isCollaborator ? (
              // For collaborators
              isEditMode ? (
                <>
                  <Button startIcon={<SaveIcon />} variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mr: 1 }}>
                    Save
                  </Button>
                  <IconButton onClick={handleEditMode}>
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton onClick={handleEditMode} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <Button
                    startIcon={isFollowing ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    variant={isFollowing ? "contained" : "outlined"}
                    color="primary"
                    onClick={handleFollowToggle}
                    sx={{ mr: 1 }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <IconButton onClick={handleClosePopup}>
                    <CloseIcon />
                  </IconButton>
                </>
              )
            ) : (
              // For regular viewers (not owner, not collaborator)
              <>
                <Button
                  startIcon={isFollowing ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  variant={isFollowing ? "contained" : "outlined"}
                  color="primary"
                  onClick={handleFollowToggle}
                  sx={{ mr: 1 }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <IconButton onClick={handleClosePopup}>
                  <CloseIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* List creator info */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Created by: {list?.user_id}
        </Typography>

        {/* Description section */}
        {!isEditMode && list?.description && (
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
            {list.description}
          </Typography>
        )}

        {/* List visibility indicator (when not in edit mode) */}
        {!isEditMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {list?.isPublic ? (
              <Chip
                icon={<PublicIcon />}
                label="Public"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            ) : (
              <Chip
                icon={<LockIcon />}
                label="Private"
                size="small"
                color="default"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            )}

            {/* Follower count chip */}
            {list?.isPublic && (
              <Chip
                icon={<BookmarkIcon />}
                label={`${followerCount} ${followerCount === 1 ? "Follower" : "Followers"}`}
                size="small"
                color="default"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            )}
            {list?.isCollaborative && (
              <Chip
                icon={<GroupIcon />}
                label={list.collaborators?.length > 0
                  ? `Collaborative (${list.collaborators.length} collaborators)`
                  : "Collaborative"}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Edit mode description */}
        {isEditMode && (
          <Box sx={{ mt: 2 }}>
            {showAddDescription || editedDescription ? (
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={2}
                value={editedDescription}
                onChange={(e) => {
                  setEditedDescription(e.target.value);
                  setListModified(true);
                }}
                sx={{ mb: 2 }}
              />
            ) : (
              <Button
                variant="outlined"
                onClick={handleAddDescriptionClick}
              >
                Add Description
              </Button>
            )}
          </Box>
        )}
      </DialogTitle>

      {/* Content area */}

      {/* List Settings in Edit Mode */}
      {isEditMode && isOwner && (
        <Box sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1
        }}>
          {/* Visibility Setting */}
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={handleVisibilityChange}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isPublic ? <PublicIcon sx={{ mr: 1 }} /> : <LockIcon sx={{ mr: 1 }} />}
                <Typography>{isPublic ? "Public List" : "Private List"}</Typography>
              </Box>
            }
          />

          {/* Collaboration Setting */}
          <FormControlLabel
            control={
              <Switch
                checked={isCollaborative}
                onChange={handleCollaborationChange}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 1 }} />
                <Typography>Allow collaboration</Typography>
              </Box>
            }
          />

          {/* Collaborators Section (only show if collaboration is enabled) */}
          {isCollaborative && (
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowCollaborators(!showCollaborators)}
                size="small"
                sx={{ mb: 1 }}
              >
                {showCollaborators ? "Hide Collaborators" : "Manage Collaborators"}
              </Button>

              {showCollaborators && (
                <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add collaborator by username"
                      value={newCollaborator}
                      onChange={(e) => setNewCollaborator(e.target.value)}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddCollaborator}
                      size="small"
                    >
                      Add
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {collaborators.length > 0 ? (
                      collaborators.map((username) => (
                        <Chip
                          key={username}
                          label={username}
                          onDelete={() => handleRemoveCollaborator(username)}
                          sx={{ m: 0.5 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No collaborators added yet
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      <DialogContent
        dividers
        sx={{
          p: 0,
          flexGrow: 1,
          overflow: 'auto'
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ m: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Search panel */}
        {searchOpen && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton sx={{ mr: 1 }}>
                <SearchIcon />
              </IconButton>
              <TextField
                fullWidth
                placeholder={`Search for ${searchType}s...`}
                variant="standard"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                variant="text"
                onClick={() => setSearchOpen(false)}
                sx={{ ml: 1 }}
              >
                Cancel
              </Button>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ pb: 2 }}>
                {searchResults.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                    onClick={() => handleAddMedia(item)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="square"
                        src={item.image}
                        alt={item.title}
                        sx={{ width: 40, height: 60, borderRadius: 1 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.year || 'Unknown year'}
                        </Typography>
                      }
                      sx={{ ml: 1 }}
                    />
                    <AddIcon color="primary" sx={{ ml: 2 }} />
                  </ListItem>
                ))}
                {searchResults.length === 0 && searchQuery && !isLoading && (
                  <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No results found. Try a different search term.
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>
        )}

        {/* Main content - List of items */}
        {!searchOpen && (
          <>
            {/* Add button */}
            {!searchOpen && (
              <>
                {/* Only show Add button for owners and collaborators */}
                {(isOwner || isCollaborator) ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddClick}
                      color="primary"
                    >
                      Add
                    </Button>
                    <Menu
                      anchorEl={mediaTypeMenu}
                      open={Boolean(mediaTypeMenu)}
                      onClose={handleCloseMediaMenu}
                    >
                      <MenuItem onClick={() => handleMediaTypeSelect('movie')}>
                        Movie
                      </MenuItem>
                      <MenuItem onClick={() => handleMediaTypeSelect('tv')}>
                        TV Show
                      </MenuItem>
                      <MenuItem onClick={() => handleMediaTypeSelect('book')}>
                        Book
                      </MenuItem>
                    </Menu>
                  </Box>
                ) : (
                  /* Show a message for non-owners */
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      You are viewing this list in read-only mode
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Items list */}
            <List sx={{ width: '100%' }}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={isEditMode}
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
                        const newItems = [...items];
                        const movedItem = newItems[draggedIdx];
                        newItems.splice(draggedIdx, 1);
                        newItems.splice(index, 0, movedItem);
                        setItems(newItems);
                        setListModified(true);
                      }
                    }}
                  >
                    <ListItem
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: isEditMode ? 'rgba(0,0,0,0.04)' : 'transparent',
                          boxShadow: isEditMode ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                        },
                        cursor: isEditMode ? 'grab' : 'default',
                        transition: 'all 0.2s',
                        borderRadius: '4px',
                        mb: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="square"
                          src={item.image}
                          alt={item.title}
                          sx={{ width: 40, height: 60, borderRadius: 1 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.year || 'Unknown year'}
                          </Typography>
                        }
                        sx={{ ml: 1 }}
                      />

                      {isEditMode && (isOwner || isCollaborator) && (
                        <IconButton
                          onClick={() => handleRemoveItem(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItem>
                    <Divider />
                  </div>
                ))
              ) : (
                <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    This list is empty. Click the Add button to add items to your list.
                  </Typography>
                </Box>
              )}
            </List>
          </>

        )}
        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={handleCloseConfirmDialog}
        >
          <ConfirmDialogTitle>{confirmDialog.title}</ConfirmDialogTitle>
          <ConfirmDialogContent>
            <DialogContentText>{confirmDialog.message}</DialogContentText>
          </ConfirmDialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
            <Button onClick={confirmDialog.onConfirm} color="primary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </ConfirmDialog>

      </DialogContent>
    </Dialog>

  );
};

export default ListDetailsPopup;