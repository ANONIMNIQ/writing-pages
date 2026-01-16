import React from 'react';
import { Link } from 'react-router-dom';
import { Draft } from '@/hooks/use-drafts';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface DraftListItemProps {
  draft: Draft;
  isPublished?: boolean;
  onDelete?: (id: string) => void;
}

const DraftListItem: React.FC<DraftListItemProps> = ({ draft, isPublished = false, onDelete }) => {
  // Generate a random tally for visual flair matching the reference image
  const tallyCount = Math.floor(Math.random() * 4) + 1;
  const tallies = Array(tallyCount).fill('|').join('');

  // Random placeholder for the circle badge on published items
  const badgeValue = Math.floor(Math.random() * 900) + 100;

  return (
    <div className="group flex items-center justify-between py-5 border-b border-border/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] px-4 -mx-4 transition-colors">
      <div className="flex-1 flex items-center space-x-6">
        {isPublished && (
          <div className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center text-[10px] font-medium text-foreground/40 shrink-0">
            {badgeValue > 1000 ? `${(badgeValue/1000).toFixed(1)}k` : badgeValue}
          </div>
        )}
        <Link 
          to={`/editor/${draft.id}`} 
          className="flex-1"
        >
          <span className={cn(
            "text-xl tracking-tight transition-colors",
            isPublished ? "text-foreground/40 font-normal" : "text-foreground/80 font-medium"
          )}>
            {draft.title || 'Untitled Entry'}
          </span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-6">
        <span className="text-[10px] font-light tracking-[0.2em] text-foreground/20 font-sans">
          {tallies}
        </span>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-foreground/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete?.(draft.id)}
                className="bg-destructive text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DraftListItem;