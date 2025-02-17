import { Link, useNavigate } from "react-router-dom";
import { Button, List, ListItem, TextField, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { fetchData, addItem } from "../api/DataPage"; // ✅ Import API functions

const DataPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchData();
      setData(fetchedData);
    };
    loadData();
  }, []);

  const handleAddItem = async () => {
    try {
      await addItem(newItem);
      const updatedData = await fetchData();
      setData(updatedData);
      setNewItem("");
    } catch (error) {
      console.error("❌ Error adding item:", error);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="customGrey"
        component={Link}
        onClick={() => {
          navigate("/");
        }}
        sx={{
          opacity: 0.5,
          padding: "12px 24px",
          textTransform: "none",
          fontSize: "1rem",
          position: "relative",
          zIndex: 10,
          transition: "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
          pointerEvents: "auto",
          "&:hover": {
            opacity: 0.9,
            transform: "scale(1.2)",
          },
        }}
      >
        {"home"}
      </Button>
      <Typography variant="h4">Data Page</Typography>
      <List>
        {data.map((item) => (
          <ListItem key={item._id}>{item.item}</ListItem>
        ))}
      </List>
      <TextField
        label="New Item"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleAddItem}>
        Add Item
      </Button>
    </div>
  );
};

export default DataPage;
