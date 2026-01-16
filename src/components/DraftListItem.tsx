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
  // Tally marks for visual flair
  const tallies = "||";

  return (
    <div className="group flex items-center justify-between py-5 border-b border-foreground/[0.03] hover:bg-foreground/[0.02] px-4 -mx-4 transition-all duration-200 rounded-sm">
      <div className="flex-1 flex items-center space-x-6">
        {isPublished && (
          <div className="w-9 h-9 rounded-full border border-foreground/10 flex items-center justify-center text-[10px] font-mono font-medium text-foreground/30 shrink-0">
            {Math.floor(Math.random() * 500) + 100}
          </div>
        )}
        <Link 
          to={`/editor/${draft.id}`} 
          className="flex-1 block"
        >
          <span className={cn(
            "text-2xl tracking-tight transition-colors",
            isPublished ? "text-foreground/30 font-light" : "text-foreground/80 font-medium"
          )}>
            {draft.title || 'Untitled'}
          </span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-6">
        <span className="text-[10px] font-light tracking-[0.3em] text-foreground/10 font-sans pointer-events-none">
          {tallies}
        </span>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-foreground/5 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-sans">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete forever?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete?.(draft.id)}
                className="bg-destructive text-white rounded-full"
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