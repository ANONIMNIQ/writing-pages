import React from 'react';
import { Link } from 'react-router-dom';
import { Draft } from '@/hooks/use-drafts';
import { cn } from '@/lib/utils';
import { Trash2, FileText, Globe } from 'lucide-react';
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
  return (
    <div className="group flex items-center justify-between py-6 border-b border-border/40 hover:bg-accent/5 px-4 -mx-4 rounded-lg transition-all duration-200">
      <div className="flex-1 flex items-center space-x-4">
        <div className="opacity-20 group-hover:opacity-100 transition-opacity">
          {isPublished ? (
            <Globe className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>
        <Link 
          to={`/editor/${draft.id}`} 
          className="flex flex-col flex-1"
        >
          <span className="text-xl font-serif tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
            {draft.title || 'Untitled Entry'}
          </span>
          <span className="text-xs font-mono uppercase tracking-widest opacity-30 mt-1">
            {new Date(draft.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <Button variant="ghost" size="sm" asChild className="rounded-full h-8 px-3 text-xs font-medium uppercase tracking-wider">
          <Link to={`/editor/${draft.id}`}>Open</Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              title="Delete entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-serif">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold tracking-tight">Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action is permanent. Your writing will be lost forever.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="rounded-full border-none hover:bg-accent">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete?.(draft.id)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full px-6"
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