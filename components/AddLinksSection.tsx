'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
  onLinksUpdated?: () => void;
}

export function AddLinksSection({ resumeId, initialLinks = [], onLinksUpdated }: AddLinksProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '', type: 'contact' as 'contact' | 'project' });

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

  return (
    <Card className="bg-white dark:bg-dark-surface border-2 border-warning">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🔗 Important Links
              {links.length === 0 && (
                <Badge className="bg-warning text-white">Missing</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-text-muted dark:text-slate-400 mt-1">
              Add clickable URLs for LinkedIn, GitHub, portfolio, and projects to improve ATS score
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              {links.length === 0 ? 'Add Links' : 'Edit Links'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Display existing links */}
        {links.length > 0 && !isEditing && (
          <div className="space-y-2 mb-4">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-text-primary dark:text-slate-100">
                    {link.label}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline truncate max-w-md"
                  >
                    {link.url}
                  </a>
                </div>
                <Badge variant="outline" className="text-xs">
                  {link.type}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Edit mode */}
        {isEditing && (
          <div className="space-y-4">
            {/* Existing links */}
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{link.label}</p>
                  <p className="text-xs text-text-muted truncate">{link.url}</p>
                </div>
                <Button
                  onClick={() => handleRemoveLink(idx)}
                  variant="outline"
                  className="text-danger hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            ))}

            {/* Add new link form */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">Add New Link</h4>
              
              <div>
                <label className="text-sm font-medium text-text-secondary dark:text-slate-300">
                  Link Type
                </label>
                <select
                  value={newLink.type}
                  onChange={(e) => setNewLink({ ...newLink, type: e.target.value as 'contact' | 'project' })}
                  className="w-full mt-1 px-3 py-2 bg-white dark:bg-dark-surface border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="contact">Contact (LinkedIn, GitHub, Portfolio)</option>
                  <option value="project">Project (Live Demo, Code Repository)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary dark:text-slate-300">
                  Label
                </label>
                <input
                  type="text"
                  placeholder="e.g., LinkedIn, GitHub, Project Demo"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white dark:bg-dark-surface border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary dark:text-slate-300">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white dark:bg-dark-surface border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <Button onClick={handleAddLink} variant="outline" className="w-full">
                + Add Link
              </Button>
            </div>

            {/* Save/Cancel buttons */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? 'Saving...' : 'Save Links'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setLinks(initialLinks);
                  setNewLink({ label: '', url: '', type: 'contact' });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {links.length === 0 && !isEditing && (
          <div className="text-center py-8 border-2 border-dashed border-warning rounded-lg">
            <p className="text-warning font-medium mb-2">
              ⚠️ No clickable URLs detected
            </p>
            <p className="text-sm text-text-muted dark:text-slate-400 mb-4">
              Add your LinkedIn, GitHub, and project links to improve your ATS score by 5-8 points!
            </p>
            <Button onClick={() => setIsEditing(true)} className="bg-warning hover:bg-orange-600">
              Add Important Links
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
