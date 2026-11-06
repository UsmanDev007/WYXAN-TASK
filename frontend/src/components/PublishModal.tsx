'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Eye, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '@/lib/types';
import { publishSite } from '@/lib/api';

interface PublishModalProps {
  isOpen: boolean;
  prefillAddress?: string;
  users: User[];
  activeUser: User | null;
  onClose: () => void;
  onPublished: (newAddress: string) => void;
}

export function PublishModal({
  isOpen,
  prefillAddress = '',
  users,
  activeUser,
  onClose,
  onPublished,
}: PublishModalProps) {
  const [address, setAddress] = useState(prefillAddress);
  const [title, setTitle] = useState('');
  const [authorHandle, setAuthorHandle] = useState(activeUser?.handle || 'alice');
  const [htmlContent, setHtmlContent] = useState('');
  const [viewTab, setViewTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (prefillAddress) {
        setAddress(prefillAddress);
      }
      if (activeUser?.handle) {
        setAuthorHandle(activeUser.handle);
      }
      if (!htmlContent) {
        // Default clean template
        setHtmlContent(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>My First Site</title>
<style>
  body { font-family: sans-serif; background: #fafafa; color: #111; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; }
  h1 { font-size: 24px; color: #16212C; border-bottom: 2px solid #E08A34; padding-bottom: 8px; }
  a { color: #2E7BD6; }
</style>
</head>
<body>
  <h1>Hello, Small Web</h1>
  <p>This is a new page published directly to the database.</p>
  <p>You can link to other sites like <a href="tidepool.zz">The Intertidal Archive</a> or <a href="atlas.void">The Unmapped Constellations</a>.</p>
</body>
</html>`);
      }
    }
  }, [isOpen, prefillAddress, activeUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanAddress = address.toLowerCase().trim();
    if (!cleanAddress) {
      setErrorMsg('Please specify an address.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a site title.');
      return;
    }

    if (!htmlContent.trim()) {
      setErrorMsg('HTML content cannot be empty.');
      return;
    }

    const selectedUser = users.find((u) => u.handle === authorHandle) || activeUser;
    const authorName = selectedUser ? selectedUser.name : 'Anonymous';

    setIsSubmitting(true);
    try {
      await publishSite({
        address: cleanAddress,
        title: title.trim(),
        htmlContent,
        authorId: authorHandle,
        authorName,
      });

      onPublished(cleanAddress);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-card border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-paper/50">
          <div>
            <h2 className="font-display font-bold text-lg text-ink">Publish to the Small Web</h2>
            <p className="text-xs text-ink-faint">
              An address and a single page of HTML written by you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-4 border-b border-line-soft bg-card overflow-y-auto max-h-48">
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 bg-alert-tint text-alert text-xs rounded-lg border border-alert/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Address */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-faint mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. coral.zz"
                  className="w-full bg-paper border border-line rounded-lg px-3 py-1.5 font-mono text-xs text-ink focus:outline-none focus:border-active"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-faint mb-1">
                  Site Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Coral Garden"
                  className="w-full bg-paper border border-line rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-active"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-faint mb-1">
                  Author
                </label>
                <select
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  className="w-full bg-paper border border-line rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-active"
                >
                  {users.map((u) => (
                    <option key={u.handle} value={u.handle}>
                      {u.name} (@{u.handle})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Edit / Preview Tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-paper/40 border-b border-line text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewTab('edit')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                  viewTab === 'edit'
                    ? 'bg-card text-ink font-semibold shadow-xs border border-line'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                HTML Source
              </button>
              <button
                type="button"
                onClick={() => setViewTab('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                  viewTab === 'preview'
                    ? 'bg-card text-ink font-semibold shadow-xs border border-line'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
            </div>
            <span className="text-[11px] text-ink-faint">HTML markup isolated in sandbox</span>
          </div>

          {/* Editor / Preview Area */}
          <div className="flex-1 min-h-[260px] relative bg-white overflow-hidden">
            {viewTab === 'edit' ? (
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>...</html>"
                className="w-full h-full p-4 font-mono text-xs text-ink bg-white focus:outline-none resize-none"
                spellCheck={false}
              />
            ) : (
              <iframe
                srcDoc={htmlContent}
                title="Preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 border-t border-line bg-card flex items-center justify-between">
            <span className="text-xs font-mono text-ink-faint">
              Will be published at <strong>{address || '...'}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink hover:bg-paper transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-ink text-paper text-xs font-medium hover:bg-ink-soft disabled:opacity-50 transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Publishing...' : 'Publish Site'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
