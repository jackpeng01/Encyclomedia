import { createTheme } from "@mui/material/styles";

export const themeSettings = (mode) => ({
  palette: {
    mode: mode,
    customGrey: { main: "#EEEEEE", contrastText: "#000000" }, // ✅ Define Custom Color
    darkGrey: {main: "#595959", contrastText: "#000000"}
  },
  typography: {
    fontFamily: `"Helvetica", "Roboto", "Arial", sans-serif`, // ✅ Change font
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    body1: { fontSize: "1rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none", // ✅ Removes shadow from all buttons
          "&:hover": {
            boxShadow: "none", // ✅ Ensures no hover shadow
          },
        },
      },
    },
  },
});

export default function getTheme(mode) {
  return createTheme(themeSettings(mode));
}
