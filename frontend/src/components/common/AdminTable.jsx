import React from 'react';

/**
 * AdminTable
 * A strict layout container for admin list views.
 * 
 * @param {Array} columns - Array of string headers.
 * @param {String} gridTemplate - CSS grid-template-columns string.
 * @param {ReactNode} children - The rows (should be mapped divs).
 * @param {String} emptyText - Text to show if there are no children.
 */
const AdminTable = ({ columns, gridTemplate, children, emptyText = 'No data found.' }) => {
  
  // Count children safely
  const childCount = React.Children.toArray(children).filter(Boolean).length;

  return (
    <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', overflow: 'hidden' }}>
      {/* Header Row */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: gridTemplate, 
          padding: '12px 16px', 
          background: 'var(--cs-bg-light)', 
          fontSize: '11px', 
          fontWeight: 600, 
          color: 'var(--cs-text-inactive)',
          borderBottom: '0.5px solid var(--cs-border)'
        }}
      >
        {columns.map((col, idx) => (
          <span key={idx}>{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {childCount > 0 ? (
          React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            
            // Clone each child to inject standard row layout
            return React.cloneElement(child, {
              style: {
                display: 'grid',
                gridTemplateColumns: gridTemplate,
                padding: '12px 16px',
                borderBottom: '0.5px solid var(--cs-border)',
                alignItems: 'center',
                ...child.props.style // Preserve any incoming styles
              }
            });
          })
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--cs-text-inactive)' }}>
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTable;
