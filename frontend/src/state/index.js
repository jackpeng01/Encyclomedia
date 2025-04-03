import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import movieReducer from "./moviesSlice";
import mediaReducer from "./mediaSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// ✅ Combine Reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  media: mediaReducer
});

// ✅ Persist Reducer Configuration (only persist auth slice, not everything)
const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["auth", "media"] // Add 'movie' if you want it persisted as well
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Create Redux Store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
