import React from 'react';

const CategoryFilter = ({ filterList, selectedFilter, onFilterChange }) => (
    <div className="filter-group">
        {filterList.map(filter => (
            <button
                key={filter}
                className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                onClick={() => onFilterChange(filter)}
            >
                {filter}
            </button>
        ))}
    </div>
);

export default CategoryFilter;
