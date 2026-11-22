// Reusable rich-text editor for admin email surfaces.
//
// Used by:
//   - src/components/AdminEmailBroadcast.jsx  (one-off broadcasts)
//   - src/components/AdminEmailSchedules.jsx  (schedule body template editor)
//
// Design choices (recorded here so the next person doesn't relitigate them):
//
//   • TipTap v3 — headless ProseMirror wrapper. The alternative "textarea + custom
//     parser" was rejected because it couldn't give us inline image insertion with
//     live preview, and emitting markdown meant another round of server-side
//     rendering before Resend ingests it.
//   • Output is sanitized HTML (NOT markdown). The DB column `email_broadcasts.body`
//     and `email_schedules.body_template` now semantically hold HTML; the server
//     dispatcher sanitizes again before sending to Resend so a crafted paste can't
//     bypass the client-side filter.
//   • Image uploads go through src/utils/emailAssets.js -> Supabase Storage bucket
//     `email-assets` (public-read). The returned public URL is inserted as
//     `<img src>` so the delivered inbox renders it without auth.
//   • Emoji insertion is handled by src/components/EmojiInsertPopover.jsx — it's a
//     popover grid, not the <select> that src/components/EmojiPicker.jsx exposes
//     for blog icons.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import EmojiInsertPopover from './EmojiInsertPopover';
import { uploadEmailImage } from '../utils/emailAssets';
import './RichTextEditor.css';

/**
 * @param {object} props
 * @param {string} props.value           Initial HTML. The editor uses this for
 *                                        the first render only; set with `key`
 *                                        from the parent to force a reset.
 * @param {(html: string) => void} props.onChange  Called on every change with the
 *                                        serialised HTML output.
 * @param {string} [props.placeholder]   Placeholder shown when the doc is empty.
 * @param {string} [props.uploadPrefix]  Folder prefix inside the email-assets
 *                                        bucket (e.g. a schedule or broadcast id).
 * @param {number} [props.minHeight]     CSS min-height for the editable area.
 * @param {string} [props.ariaLabel]
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the email body…',
  uploadPrefix = 'inline',
  minHeight = 260,
  ariaLabel = 'Email body editor',
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const editor = useEditor({
    // Cloudflare Pages SSR keeps React out of the server bundle, so we can
    // render immediately on the client without hydration mismatches.
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // StarterKit v3 bundles its own Link extension; swap its defaults for
        // open-in-new-tab + no referrer leakage.
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
        codeBlock: false, // email clients render pre blocks inconsistently
      }),
      // Keep the Link extension registered standalone too so `editor.commands.setLink`
      // is always available, even if a future StarterKit tweak drops it.
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { style: 'max-width:100%;height:auto;border-radius:8px;' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      if (typeof onChange === 'function') onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        role: 'textbox',
        'aria-multiline': 'true',
        class: 'rte-prose',
      },
    },
  });

  // If the parent swaps `value` (e.g. opens a different schedule row), sync it.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || '') !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const triggerFilePick = useCallback(() => {
    if (!fileInputRef.current) return;
    setUploadError(null);
    fileInputRef.current.value = ''; // allow re-selecting the same file
    fileInputRef.current.click();
  }, []);

  const onFileChosen = useCallback(
    async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file || !editor) return;
      setUploading(true);
      setUploadError(null);
      try {
        const { url } = await uploadEmailImage(file, { prefix: uploadPrefix });
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: file.name })
          .run();
      } catch (err) {
        setUploadError(err.message || 'Upload failed.');
      } finally {
        setUploading(false);
      }
    },
    [editor, uploadPrefix]
  );

  const promptLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter the URL (leave blank to remove):', prev);
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    // Make sure the url has a scheme; default to https://.
    const finalUrl = /^https?:\/\//i.test(url) || /^mailto:/i.test(url)
      ? url
      : `https://${url}`;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: finalUrl })
      .run();
  }, [editor]);

  const insertEmoji = useCallback(
    (emoji) => {
      if (!editor) return;
      editor.chain().focus().insertContent(emoji).run();
    },
    [editor]
  );

  if (!editor) {
    return <div className="rte-shell rte-loading">Loading editor…</div>;
  }

  const isActive = (name, attrs) => editor.isActive(name, attrs);

  // 44×44 touch targets on mobile — see AdminDashboard.css @media rule set.
  return (
    <div className="rte-shell" style={{ '--rte-min-h': `${minHeight}px` }}>
      <div className="rte-toolbar" role="toolbar" aria-label="Formatting">
        <ToolbarBtn
          title="Bold (Ctrl+B)"
          active={isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic (Ctrl+I)"
          active={isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 2"
          active={isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 3"
          active={isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarBtn>

        <span className="rte-sep" aria-hidden="true" />

        <ToolbarBtn
          title="Bullet list"
          active={isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered list"
          active={isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarBtn>
        <ToolbarBtn
          title="Blockquote"
          active={isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarBtn>

        <span className="rte-sep" aria-hidden="true" />

        <ToolbarBtn title="Link" active={isActive('link')} onClick={promptLink}>
          🔗
        </ToolbarBtn>

        <ToolbarBtn
          title={uploading ? 'Uploading…' : 'Insert image (max 5 MB)'}
          disabled={uploading}
          onClick={triggerFilePick}
        >
          {uploading ? <span className="rte-spinner" aria-hidden="true" /> : '🖼️'}
          <span className="rte-btn-label">{uploading ? 'Uploading…' : 'Image'}</span>
        </ToolbarBtn>

        <EmojiInsertPopover onPick={insertEmoji} />

        <span className="rte-sep" aria-hidden="true" />

        <ToolbarBtn
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          🧹
        </ToolbarBtn>

        <ToolbarBtn
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </ToolbarBtn>
        <ToolbarBtn
          title="Redo (Ctrl+Shift+Z)"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </ToolbarBtn>
      </div>

      {uploadError && (
        <div className="rte-upload-err" role="alert">
          ⚠️ {uploadError}
        </div>
      )}

      <EditorContent editor={editor} className="rte-content" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={onFileChosen}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

function ToolbarBtn({ title, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active ? 'true' : 'false'}
      className={`rte-btn${active ? ' rte-btn-active' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
