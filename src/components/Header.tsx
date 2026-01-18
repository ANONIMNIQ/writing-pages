import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { useDrafts } from '@/hooks/use-drafts';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAdmin }) => {
  const { createDraft } = useDrafts();
  const navigate = useNavigate();

  const handleCreate = async () => {
    const newId = await createDraft();
    if (newId) navigate(`/editor/${newId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight font-serif">Wr1te Pages</span>
              <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary/60 border-none">
                Beta
              </Badge>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Button 
            onClick={handleCreate}
            variant="outline"
            size="sm"
            className="rounded-full border-border/60 hover:bg-accent gap-2 h-9 px-4 text-xs font-bold uppercase tracking-widest hidden sm:flex"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </Button>
          
          <div className="flex items-center space-x-1">
            <ThemeToggle />
            <UserMenu isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </header>
  );
};