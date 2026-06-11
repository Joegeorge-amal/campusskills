import React, { useRef, useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import './CategoryFilterTabs.css';

const CategoryFilterTabs = ({ categories, activeCategory, onSelectCategory, variant }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    
    // Double check after a tiny delay for React rendering/fonts
    const timeoutId = setTimeout(checkScroll, 50);
    
    // Robustly watch for resize of the container itself
    const observer = new ResizeObserver(() => checkScroll());
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }
    
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [categories]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const maskLeft = showLeftArrow ? 'transparent, black 40px' : 'black, black 40px';
  const maskRight = showRightArrow ? 'black calc(100% - 40px), transparent' : 'black calc(100% - 40px), black';
  const maskImage = `linear-gradient(to right, ${maskLeft}, ${maskRight})`;

  return (
    <div className={`cat-filter-wrapper ${variant === 'marketplace' ? 'marketplace-variant' : ''}`}>
      {showLeftArrow && (
        <button className="scroll-arrow left" onClick={() => scroll('left')}>
          <IconChevronLeft size={18} />
        </button>
      )}
      
      <div 
        className="cat-filter-tabs" 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        style={{
          WebkitMaskImage: maskImage,
          maskImage: maskImage
        }}
      >
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

      {showRightArrow && (
        <button className="scroll-arrow right" onClick={() => scroll('right')}>
          <IconChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

export default CategoryFilterTabs;
