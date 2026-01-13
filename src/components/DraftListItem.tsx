import React from 'react';
import { Link } from 'react-router-dom';
import { Draft } from '@/types/draft';
import { cn } from '@/lib/utils';

interface DraftListItemProps {
  draft: Draft;
  isPublished?: boolean;
}

const DraftListItem: React.FC<DraftListItemProps> = ({ draft, isPublished = false }) => {
  // Simple placeholder for word count/read time visualization (the vertical bars in Svbtle)
  const wordCountPlaceholder = (
    <div className="flex space-x-0.5 h-4 items-end opacity-50">
      <div className="w-0.5 h-2 bg-foreground/50"></div>
      <div className="w-0.5 h-3 bg-foreground/50"></div>
      <div className="w-0.5 h-4 bg-foreground/50"></div>
      <div className="w-0.5 h-2 bg-foreground/50"></div>
    </div>
  );

  const countDisplay = isPublished ? (
    <div className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center text-xs font-medium text-foreground/70">
      {Math.floor(Math.random() * 2000) + 1}
    </div>
  ) : null;

  return (
    <Link 
      to={`/editor/${draft.id}`} 
      className={cn(
        "flex justify-between items-center py-2 transition-colors",
        isPublished ? "hover:text-primary" : "hover:text-primary"
      )}
    >
      <div className="flex items-center space-x-4">
        {countDisplay}
        <span className={cn(
          "text-xl font-light font-serif",
          isPublished ? "text-foreground/80" : "text-foreground"
        )}>
          {draft.title}
        </span>
      </div>
      {wordCountPlaceholder}
    </Link>
  );
};

export default DraftListItem;