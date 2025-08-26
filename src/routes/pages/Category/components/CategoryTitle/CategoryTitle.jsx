import React from 'react';

import './CategoryTitle.css'

const CategoryTile = ({ icon, label, onClick }) => (
    <button className="category-tile" onClick={onClick}>
        <span className="category-tile-icon">{icon}</span>
        <span className="category-tile-label">{label}</span>
    </button>
);

export default CategoryTile;
