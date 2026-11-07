'use client';

import React, { useState, useEffect } from 'react';
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

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>My First Site</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; color: #202124; max-width: 680px; margin: 40px auto; padding: 24px; line-height: 1.6; }
  h1 { font-size: 26px; color: #1a73e8; border-bottom: 2px solid #e8eaed; padding-bottom: 10px; margin-bottom: 16px; font-weight: 500; }
  p { margin-bottom: 14px; font-size: 15px; color: #3c4043; }
  a { color: #1a73e8; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <h1>Welcome to my Small Web site</h1>
  <p>This is a new page published directly to the database.</p>
  <p>You can link to other sites like <a href="tidepool.zz">The Intertidal Archive</a> or <a href="atlas.void">The Unmapped Constellations</a>.</p>
</body>
</html>`;

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
  const [authorHandle, setAuthorHandle] = useState(activeUser?.handle || '');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [viewTab, setViewTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (prefillAddress) setAddress(prefillAddress);
      if (activeUser?.handle) setAuthorHandle(activeUser.handle);
      setErrorMsg('');
    }
  }, [isOpen, prefillAddress, activeUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanAddress = address.toLowerCase().trim();
    if (!cleanAddress) { setErrorMsg('Please enter an address.'); return; }
    if (!title.trim()) { setErrorMsg('Please enter a site title.'); return; }
    if (!htmlContent.trim()) { setErrorMsg('HTML content cannot be empty.'); return; }

    const selectedUser = users.find((u) => u.handle === authorHandle) || activeUser;
    setIsSubmitting(true);
    try {
      await publishSite({
        address: cleanAddress,
        title: title.trim(),
        htmlContent,
        authorId: authorHandle || 'anonymous',
        authorName: selectedUser?.name || 'Anonymous',
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
    <div
      className="modal-overlay"
      style={{ alignItems: 'center', paddingTop: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="google-dialog" style={{ maxWidth: 740, height: '82vh' }}>
        {/* Header */}
        <div className="google-dialog-header">
          <div className="google-dialog-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Publish to Small Web
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Metadata Fields */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #dadce0', background: '#ffffff', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {errorMsg && (
              <div style={{ gridColumn: 'span 3', padding: '8px 12px', background: '#fce8e6', color: '#c5221f', borderRadius: 8, fontSize: 12 }}>
                {errorMsg}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5f6368', marginBottom: 4, textTransform: 'uppercase' }}>
                Address (Domain)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. coral.zz"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #dadce0', fontSize: 13, background: '#f8f9fa', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5f6368', marginBottom: 4, textTransform: 'uppercase' }}>
                Site Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Coral Garden"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #dadce0', fontSize: 13, background: '#f8f9fa', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5f6368', marginBottom: 4, textTransform: 'uppercase' }}>
                Author
              </label>
              <select
                value={authorHandle}
                onChange={(e) => setAuthorHandle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #dadce0', fontSize: 13, background: '#f8f9fa', outline: 'none' }}
              >
                {users.map((u) => (
                  <option key={u.handle} value={u.handle}>{u.name} (@{u.handle})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #dadce0', background: '#f8f9fa', padding: '0 16px' }}>
            <button
              type="button"
              onClick={() => setViewTab('edit')}
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 500,
                color: viewTab === 'edit' ? '#1a73e8' : '#5f6368',
                borderBottom: viewTab === 'edit' ? '2px solid #1a73e8' : '2px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
              }}
            >
              HTML Code
            </button>
            <button
              type="button"
              onClick={() => setViewTab('preview')}
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 500,
                color: viewTab === 'preview' ? '#1a73e8' : '#5f6368',
                borderBottom: viewTab === 'preview' ? '2px solid #1a73e8' : '2px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
              }}
            >
              Live Preview
            </button>
          </div>

          {/* Editor / Preview Area */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#ffffff' }}>
            {viewTab === 'edit' ? (
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                style={{ width: '100%', height: '100%', padding: 16, border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: 12, resize: 'none' }}
                spellCheck={false}
              />
            ) : (
              <iframe
                srcDoc={htmlContent}
                title="Preview"
                sandbox="allow-scripts"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #dadce0', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #dadce0', background: '#ffffff', color: '#5f6368', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="google-btn-primary"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
