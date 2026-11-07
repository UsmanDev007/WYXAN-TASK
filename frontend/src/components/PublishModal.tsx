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
  body { font-family: 'Georgia', serif; background: #fafafa; color: #111; max-width: 640px; margin: 40px auto; padding: 20px; line-height: 1.7; }
  h1 { font-size: 26px; color: #16212C; border-bottom: 2px solid #E08A34; padding-bottom: 10px; margin-bottom: 20px; }
  p { margin-bottom: 14px; }
  a { color: #2E7BD6; }
  a:hover { text-decoration: none; }
</style>
</head>
<body>
  <h1>Hello, Small Web</h1>
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
    if (!cleanAddress) { setErrorMsg('Please specify an address.'); return; }
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
      <div className="publish-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Publish to the Small Web</div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
              An address and a single page of HTML written by you.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-soft)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Fields */}
          <div className="modal-body" style={{ maxHeight: 180, overflowY: 'auto' }}>
            {errorMsg && (
              <div className="error-banner">⚠ {errorMsg}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address</label>
                <input
                  className="form-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. coral.zz"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Site Title</label>
                <input
                  className="form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Coral Garden"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Author</label>
                <select
                  className="form-input"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.handle} value={u.handle}>{u.name} (@{u.handle})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="modal-tabs">
            <button
              type="button"
              className={`modal-tab${viewTab === 'edit' ? ' active' : ''}`}
              onClick={() => setViewTab('edit')}
            >
              ◇ HTML Source
            </button>
            <button
              type="button"
              className={`modal-tab${viewTab === 'preview' ? ' active' : ''}`}
              onClick={() => setViewTab('preview')}
            >
              ◈ Live Preview
            </button>
            <span style={{ marginLeft: 'auto', padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', alignSelf: 'center' }}>
              HTML isolated in sandbox
            </span>
          </div>

          {/* Editor / Preview */}
          <div style={{ flex: 1, minHeight: 280, background: '#fff', overflow: 'hidden', position: 'relative' }}>
            {viewTab === 'edit' ? (
              <textarea
                className="form-textarea"
                style={{ width: '100%', height: '100%', borderRadius: 0, border: 'none', resize: 'none', minHeight: 'unset' }}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>...</html>"
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
          <div className="modal-footer">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', marginRight: 'auto' }}>
              Publishing to: <strong style={{ color: 'var(--ink)' }}>{address || '…'}</strong>
            </span>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                  Publishing…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Publish Site
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
