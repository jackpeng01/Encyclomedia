import { createSlice } from "@reduxjs/toolkit";

const initialUserState = {
  isDarkMode: false
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { setDarkMode} = userSlice.actions;
export default userSlice.reducer;
