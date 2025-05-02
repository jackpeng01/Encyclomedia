import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';

const TrailerModal = ({ isOpen, onClose, trailer_key }) => {
    useEffect(() => {
        if (isOpen) {
            // Disable body scrolling
            document.body.style.overflow = 'hidden';
        } else {
            // Restore body scrolling when the modal is closed
            document.body.style.overflow = '';
        }

        // Cleanup to ensure the overflow style is restored when the component is unmounted
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;  // If modal is closed, do not render it
    }

    return (
        <div
            style={{
                display: 'block',  // Ensure modal is visible
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
                zIndex: 10001, // Ensure it's above other elements
            }}
        >
            <div
                style={{
                    position: 'relative',
                    top: '20%',
                    transform: 'translateY(-50%)',
                    margin: '0 auto',
                    width: '80%',
                    maxWidth: '800px',
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                }}
            >
                {/* Close button styled like "Watch Trailer" */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '0.5rem 1rem',
                        borderRadius: '5px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease', // Smooth transition for hover effect
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
                >
                    Close
                </button>
                
                <h2>Watch Trailer</h2>
                
                {/* Check if trailer_key is undefined */}
                {trailer_key ? (
                    <iframe
                        width="100%"
                        height="400"
                        src={`https://www.youtube.com/embed/${trailer_key}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <p>Trailer is not available at the moment.</p>
                )}
            </div>
        </div>
    );
};

export default TrailerModal;
