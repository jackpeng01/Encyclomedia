import { createSlice } from "@reduxjs/toolkit";

const initialUserState = {
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.token = null;
    },
  },
});

export const { setToken, logout } = userSlice.actions;
export default userSlice.reducer;
