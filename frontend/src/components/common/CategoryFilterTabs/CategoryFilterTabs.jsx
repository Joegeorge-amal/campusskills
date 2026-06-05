import React from 'react';
import './CategoryFilterTabs.css';

const CategoryFilterTabs = ({ categories, activeCategory, onSelectCategory, variant }) => {
  return (
    <div className={`cat-filter-tabs ${variant === 'marketplace' ? 'wrap' : ''}`}>
      {categories.map(cat => (
        <button
          key={cat}
          className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat === 'Language' ? 'Languages' : cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilterTabs;
