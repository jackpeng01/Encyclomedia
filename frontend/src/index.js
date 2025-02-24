import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { store, persistor } from "./state"; // ✅ Import updated store
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Modal from "react-modal";
import { NotificationProvider } from "./widgets/NotificationWidget";

// ✅ Ensure Modal works properly
Modal.setAppElement("#root");

// ✅ Create Root React Element
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
