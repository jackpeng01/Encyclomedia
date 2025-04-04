import { createSlice } from '@reduxjs/toolkit';

// Define the initial state for media
const initialState = {
    movies: [],
    shows: [],
    books: [],
};

// Create the media slice
const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        // Action to set the movies
        setMovies: (state, action) => {
            state.movies = action.payload;
        },
        // Action to set the shows
        setShows: (state, action) => {
            state.shows = action.payload;
        },
        // Action to set the books
        setBooks: (state, action) => {
            state.books = action.payload;
        },

        clearMedia: (state) => {
            state.movies = [];
            state.shows = [];
            state.books = [];
          },
    },
});

// Export the actions
export const { setMovies, setShows, setBooks, clearMedia } = mediaSlice.actions;

// Export the reducer
export default mediaSlice.reducer;
