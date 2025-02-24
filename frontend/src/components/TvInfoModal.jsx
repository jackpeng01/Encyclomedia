import React from 'react';
import { Dialog, DialogContent } from '@mui/material';

const TvInfoModal = ({ open, onClose, result, info }) => {
  //if (!open) return null; // Don't render anything if the dialog isn't visible

  return (
    <Dialog
        open={open}
        onClose={() => {
          onClose();
        }}>
        <DialogContent>
        <p><b>{result}</b></p>
        <p>{info}</p>
        <button onClick={onClose} style={{ marginRight: '450px' }}>Close</button>
        <button onClick={onClose}>Save</button>
        </DialogContent>
      </Dialog>
  );
};

export default TvInfoModal;
