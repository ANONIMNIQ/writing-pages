import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Bell, User, Plus } from 'lucide-react';
import ExportOptions from '@/components/ExportOptions';
import { toast } from 'sonner';
import { useAutosizeTextArea } from '@/hooks/use-autosize-textarea';

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDraft, updateDraft } = useDrafts();
  
  const initialDraft = id ? getDraft(id) : undefined;

  const [title, setTitle] = useState(initialDraft?.title || 'Title');
  const [content, setContent] = useState(initialDraft?.content || 'Tell your story...');
  const [isSaved, setIsSaved] = useState(true);

  const titleRef = useAutosizeTextArea(title);
  const contentRef = useAutosizeTextArea(content);

  useEffect(() => {
    if (!id || !initialDraft) {
      // If ID is missing or draft not found, redirect to dashboard
      navigate('/');
      toast.error("Draft not found.");
    }
  }, [id, initialDraft, navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (!id) return;

    const handler = setTimeout(() => {
      if (!isSaved) {
        updateDraft(id, { title, content });
        setIsSaved(true);
        toast.success("Draft saved.", { duration: 1500 });
      }
    }, 1500); // Save every 1.5 seconds of inactivity

    return () => clearTimeout(handler);
  }, [title, content, isSaved, id, updateDraft]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handlePublish = useCallback(() => {
    if (!id) return;
    updateDraft(id, { status: 'published' });
    toast.success("Entry published!");
    navigate('/');
  }, [id, updateDraft, navigate]);

  if (!id || !initialDraft) {
    return null; // Wait for redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="p-4 border-b border-border/50 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-serif font-bold tracking-tight">
            Dyad Writer
          </Link>
          <span className="text-sm text-muted-foreground">
            {isSaved ? 'Saved' : 'Saving...'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1 h-auto text-sm font-medium"
          >
            Publish
          </Button>
          
          <ExportOptions title={title} content={content} />

          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </header>

      {/* Writing Area */}
      <main className="flex-1 flex justify-center p-8 md:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-3xl">
          
          {/* Title Input */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            className="w-full resize-none text-5xl font-serif font-extrabold leading-tight mb-8 focus:outline-none bg-transparent placeholder:text-gray-300 overflow-hidden"
            placeholder="Title"
            rows={1}
            style={{ minHeight: '60px' }}
          />
          
          {/* Content Input */}
          <div className="flex space-x-4">
            {/* Placeholder for the '+' button seen in Medium */}
            <div className="pt-2">
              <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            
            <textarea
              ref={contentRef}
              value={content}
              onChange={handleContentChange}
              className="flex-1 resize-none text-xl font-serif leading-relaxed focus:outline-none bg-transparent placeholder:text-gray-300 overflow-hidden"
              placeholder="Tell your story..."
              rows={10}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;