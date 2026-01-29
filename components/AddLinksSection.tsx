'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Link {
  label: string;
  url: string;
  type: 'contact' | 'project';
}

interface AddLinksProps {
  resumeId: string;
  initialLinks?: Link[];
  parsedContact?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  onLinksUpdated?: () => void;
}

export function AddLinksSection({ resumeId, initialLinks = [], parsedContact, onLinksUpdated }: AddLinksProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '', type: 'contact' as 'contact' | 'project' });

  // Auto-populate links from parsed contact info
  useEffect(() => {
    if (links.length === 0 && parsedContact) {
      const autoLinks: Link[] = [];
      if (parsedContact.linkedin) {
        autoLinks.push({ label: 'LinkedIn', url: parsedContact.linkedin, type: 'contact' });
      }
      if (parsedContact.github) {
        autoLinks.push({ label: 'GitHub', url: parsedContact.github, type: 'contact' });
      }
      if (parsedContact.website) {
        autoLinks.push({ label: 'Portfolio', url: parsedContact.website, type: 'contact' });
      }
      if (autoLinks.length > 0) {
        setLinks(autoLinks);
      }
    }
  }, [parsedContact, links.length]);

  const handleAddLink = () => {
    if (!newLink.label || !newLink.url) return;

    // Validate URL
    if (!newLink.url.startsWith('http://') && !newLink.url.startsWith('https://')) {
      alert('URL must start with http:// or https://');
      return;
    }

    setLinks([...links, { ...newLink }]);
    setNewLink({ label: '', url: '', type: 'contact' });
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });

      if (!response.ok) {
        throw new Error('Failed to save links');
      }

      setIsEditing(false);
      onLinksUpdated?.();
    } catch (error) {
      alert('Failed to save links. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasMissingLinks = links.length === 0;

  return (
    <div className={hasMissingLinks ? "bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4" : ""}>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary dark:text-slate-100">
              🔗 Professional Links
            </h3>
            {hasMissingLinks && (
              <Badge className="bg-yellow-500 text-white text-xs">Missing</Badge>
            )}
          </div>
          {hasMissingLinks && (
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Add LinkedIn/GitHub to boost your score by 5 points
            </p>
          )}
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            size="sm"
            className="text-xs h-7 px-3"
          >
            {links.length === 0 ? '+ Add' : 'Edit'}
          </Button>
        )}
      </div>

      {/* Display existing links (compact) */}
      {links.length > 0 && !isEditing && (
        <div className="flex flex-wrap gap-2">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              <span className="font-medium text-text-primary dark:text-slate-100">{link.label}</span>
              <span className="text-primary">→</span>
            </a>
          ))}
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="space-y-3 mt-2">
          {/* Existing links */}
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 p-2 rounded">
              <div className="flex-1">
                <p className="font-medium text-xs">{link.label}</p>
                <p className="text-xs text-text-muted truncate">{link.url}</p>
              </div>
              <Button
                onClick={() => handleRemoveLink(idx)}
                size="sm"
                className="text-xs h-6 px-2 bg-red-50 hover:bg-red-100 text-red-600"
              >
                Remove
              </Button>
            </div>
          ))}

          {/* Add new link form (compact) */}
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded p-3 space-y-2">
            <h4 className="font-medium text-xs">Add New Link</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-text-secondary dark:text-slate-300">Type</label>
                <select
                  value={newLink.type}
                  onChange={(e) => setNewLink({ ...newLink, type: e.target.value as 'contact' | 'project' })}
                  className="w-full mt-1 px-2 py-1 text-xs bg-white dark:bg-dark-surface border border-slate-300 dark:border-slate-700 rounded"
                >
                  <option value="contact">Contact</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary dark:text-slate-300">Label</label>
                <input
                  type="text"
                  placeholder="LinkedIn"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  className="w-full mt-1 px-2 py-1 text-xs bg-white dark:bg-dark-surface border border-slate-300 dark:border-slate-700 rounded"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary dark:text-slate-300">URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full mt-1 px-2 py-1 text-xs bg-white dark:bg-dark-surface border border-slate-300 dark:border-slate-700 rounded"
              />
            </div>

            <Button onClick={handleAddLink} size="sm" className="w-full text-xs h-7">
              + Add Link
            </Button>
          </div>

          {/* Save/Cancel buttons */}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="flex-1 text-xs h-7">
              {isSaving ? 'Saving...' : 'Save Links'}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setLinks(initialLinks);
                setNewLink({ label: '', url: '', type: 'contact' });
              }}
              size="sm"
              className="flex-1 text-xs h-7 bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
