import React from 'react';
import './TwoColumnLayout.css';

interface TwoColumnLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  className?: string;
}

/**
 * A flexible two-column layout component that takes up full width
 * and divides the space equally between two columns.
 * 
 * @param leftContent - Content to be displayed in the left column
 * @param rightContent - Content to be displayed in the right column
 * @param className - Optional additional CSS class names
 */
export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  leftContent,
  rightContent,
  className = '',
}) => {
  return (
    <div className={`two-column-layout ${className}`}>
      <div className="two-column-layout__column">
        {leftContent}
      </div>
      <div className="two-column-layout__column">
        {rightContent}
      </div>
    </div>
  );
}; 