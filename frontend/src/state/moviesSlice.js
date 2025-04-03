// moviesSlice.js

import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
    list: [], // Initial empty array
    loading: false,
    error: null,
};

// Create the slice
const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        setMovies: (state, action) => {
            state.list = action.payload; // Update the list with the fetched movies
        },
        clearMovies: (state) => {
            state.list = []; // Clear the movies list
          },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

// Export the actions
export const { setMovies, clearMovies, setLoading, setError } = moviesSlice.actions;

// Export the reducer
export default moviesSlice.reducer;
