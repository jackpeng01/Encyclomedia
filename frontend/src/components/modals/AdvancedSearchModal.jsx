import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    Button,
    Box,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
} from "@mui/material";

const AdvancedSearchModal = ({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    yearStart,
    setYearStart,
    yearEnd,
    setYearEnd,
    genre,
    setGenre,
    minRating,
    setMinRating,
    maxRating,
    setMaxRating,
    handleSearchSubmit,
    category,
}) => {
    const movieGenres = [
        "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
        "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
        "Science Fiction", "Thriller", "TV Movie", "War", "Western"
    ];

    const bookGenres = [
        "Algebra", "Animals", "Anthropology", "Art History", "Art Instruction", "Arts", "Architecture", 
        "Autobiographies", "Bears", "Biography", "Biology", "Business & Finance", "Business Economics", 
        "Business Success", "Children's", "Chemistry", "Composers", "Cooking", "Cookbooks", "Design", "Dogs", 
        "Exercise", "Fantasy", "Fashion", "Finance", "Fiction", "Graphic Design", "Health & Wellness", 
        "Historical Fiction", "Horror", "Humor", "Indonesian", "Kids Books", "Kings and Rulers", "Kittens", 
        "Literature", "Magic", "Management", "Mathematics", "Mental Health", "Music", "Music Theory", "Mystery and detective stories", 
        "Philosophy", "Painting", "Poetry", "Political Science", "Programming", "Psychology", "Romance", 
        "Science & Mathematics", "Science Fiction", "Self-help", "Short Stories", "Social Sciences", "Social Life and Customs", 
        "Thriller", "Textbooks", "War", "World War II", "Women", "Young Adult"
    ];
    
    const handleGenreChange = (event) => {
        const { value } = event.target;
        setGenre(typeof value === "string" ? value.split(",") : value);
    };

    // Choose genres based on the category
    const genresToDisplay = category === "books" ? bookGenres : movieGenres;

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Advanced Search</DialogTitle>
            <DialogContent>
                {/* Search Input */}
                <FormControl fullWidth sx={{ marginTop: 1, marginBottom: 2 }}>
                    <TextField
                        label="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                    />
                </FormControl>

                {/* Year Range Inputs */}
                {category !== "books" && (
                <Box display="flex" justifyContent="space-between">
                    <FormControl sx={{ width: "48%" }} fullWidth>
                        <TextField
                            label="Start Year"
                            type="number"
                            value={yearStart}
                            onChange={(e) => setYearStart(e.target.value)}
                        />
                    </FormControl>

                    <FormControl sx={{ width: "48%" }} fullWidth>
                        <TextField
                            label="End Year"
                            type="number"
                            value={yearEnd}
                            onChange={(e) => setYearEnd(e.target.value)}
                        />
                    </FormControl>
                </Box>
                )}

                {/* Genre Input (Multiple Selection) */}
                <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
                    <Select
                        multiple
                        value={genre}
                        onChange={handleGenreChange}
                        renderValue={(selected) => selected.length ? selected.join(", ") : "Genre(s)"}
                        displayEmpty
                    >
                        {genresToDisplay.map((genreOption) => (
                            <MenuItem key={genreOption} value={genreOption}>
                                <Checkbox checked={genre.indexOf(genreOption) > -1} />
                                <ListItemText primary={genreOption} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Rating Range Inputs (Hide if category is 'books') */}
                {category !== "books" && (
                    <Box display="flex" justifyContent="space-between">
                        <FormControl sx={{ width: "48%" }} fullWidth>
                            <TextField
                                label="Min Rating"
                                type="number"
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                inputProps={{
                                    min: 0,
                                    max: 10,
                                }}
                            />
                        </FormControl>

                        <FormControl sx={{ width: "48%" }} fullWidth>
                            <TextField
                                label="Max Rating"
                                type="number"
                                value={maxRating}
                                onChange={(e) => setMaxRating(e.target.value)}
                                inputProps={{
                                    min: 0,
                                    max: 10,
                                }}
                            />
                        </FormControl>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSearchSubmit} variant="contained">
                    Search
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdvancedSearchModal;
