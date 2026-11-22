// Small emoji grid popover for inserting characters into an editor at the
// current caret position.
//
// This is distinct from src/components/EmojiPicker.jsx — that component is a
// native <select> + <optgroup> designed to set the `icon` column on a blog
// post. It can't be used to type into a contenteditable editor because it
// doesn't bubble up a "pick" event with the raw emoji string.
//
// Usage:
//   <EmojiInsertPopover onPick={(emoji) => editor.commands.insertContent(emoji)} />
//
// Renders a 🙂 trigger button that toggles a 6-column grid. Grouped by
// theme, searchable via the input at the top. No external deps.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './EmojiInsertPopover.css';

const EMOJI_GROUPS = [
  {
    label: 'Smileys',
    emojis: ['😀', '😁', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😎', '🤩', '🤓', '🧐', '😴', '😅', '🥳'],
  },
  {
    label: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '🙏', '👊', '✊', '🤝', '✌️', '🤞', '🤟', '🤙', '💪', '👀', '👋'],
  },
  {
    label: 'Hearts & symbols',
    emojis: ['❤️', '💙', '💚', '💛', '🧡', '💜', '🤍', '🖤', '💔', '❣️', '💯', '✅', '❌', '❓', '❗', '⚠️', '🔥', '⭐', '✨', '🎯'],
  },
  {
    label: 'Work & tech',
    emojis: ['💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '📱', '☎️', '📧', '📨', '📝', '📄', '📊', '📈', '📉', '📅', '📌', '🔗', '🔒', '🔑'],
  },
  {
    label: 'Cloud & architecture',
    emojis: ['☁️', '🌐', '🏢', '🏗️', '⚙️', '🧩', '🔧', '🔨', '🛠️', '🧱', '📦', '🚀', '🚦', '🧭', '🛡️'],
  },
  {
    label: 'Objects & misc',
    emojis: ['🎉', '🎁', '💡', '🔔', '📣', '☕', '🍕', '🕒', '📍', '🏷️', '🏆', '🎓', '🧠', '👀', '👉', '👈', '➡️', '⬅️', '⬆️', '⬇️'],
  },
];

const ALL_EMOJIS = EMOJI_GROUPS.flatMap((g) => g.emojis.map((e) => ({ e, group: g.label })));

export default function EmojiInsertPopover({ onPick, buttonLabel = '😊' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (ev) => {
      if (rootRef.current && !rootRef.current.contains(ev.target)) {
        setOpen(false);
      }
    };
    const esc = (ev) => {
      if (ev.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    // Match on group label (so typing "cloud" surfaces the cloud group).
    return ALL_EMOJIS.filter((row) => row.group.toLowerCase().includes(q));
  }, [query]);

  const handlePick = (emoji) => {
    if (typeof onPick === 'function') onPick(emoji);
    setOpen(false);
    setQuery('');
  };

  return (
    <span className="eip-root" ref={rootRef}>
      <button
        type="button"
        className="eip-trigger"
        aria-label="Insert emoji"
        aria-haspopup="dialog"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen((v) => !v)}
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="eip-pop" role="dialog" aria-label="Insert emoji">
          <input
            type="text"
            className="eip-search"
            placeholder="Search emoji group"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="eip-scroll">
            {filtered ? (
              <div className="eip-grid">
                {filtered.map(({ e }, i) => (
                  <button
                    key={`${e}-${i}`}
                    type="button"
                    className="eip-cell"
                    onClick={() => handlePick(e)}
                    title={e}
                  >
                    {e}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="eip-empty">No emoji groups match "{query}".</div>
                )}
              </div>
            ) : (
              EMOJI_GROUPS.map((group) => (
                <section key={group.label} className="eip-group">
                  <h5 className="eip-group-title">{group.label}</h5>
                  <div className="eip-grid">
                    {group.emojis.map((e, i) => (
                      <button
                        key={`${e}-${i}`}
                        type="button"
                        className="eip-cell"
                        onClick={() => handlePick(e)}
                        title={e}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      )}
    </span>
  );
}
