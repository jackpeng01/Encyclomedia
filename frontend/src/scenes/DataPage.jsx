import React from "react";
import { Button, TextField, Typography, List, ListItem } from "@mui/material";

const DataPage = ({ data, newItem, setNewItem, addItem }) => {
  return (
    <div>
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
      <Button variant="contained" color="primary" onClick={addItem}>
        Add Item
      </Button>
    </div>
  );
};

export default DataPage;