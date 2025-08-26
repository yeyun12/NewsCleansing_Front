import React from 'react';
import './BaseButton.css';

const BaseButton = ({ children, onClick, className }) => {
    return (
        <button onClick={onClick} className={`base-button ${className || ''}`}>
            {children}
        </button>
    );
};

export default BaseButton;
