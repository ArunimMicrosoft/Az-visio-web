// EmojiPicker — tiny controlled <select> for the `icon` column on blog posts.
// Native <select> with <optgroup> keeps the implementation dependency-free and
// renders a familiar OS-level dropdown. If a stored icon is not in the preset
// list (e.g. an older post or a custom emoji), it is surfaced as a disabled
// first option so the data is never lost on edit.
import React from 'react';

export const EMOJI_GROUPS = [
  {
    label: 'Services',
    emojis: ['🧭', '🧩', '🔧', '🧱', '🏗️', '🚀', '⚙️', '📦'],
  },
  {
    label: 'Architecture',
    emojis: ['🏢', '🏛️', '🌐', '🔗', '📐', '🗺️'],
  },
  {
    label: 'Security',
    emojis: ['🔐', '🛡️', '🪪', '🔒', '🕵️', '🚨'],
  },
  {
    label: 'Data',
    emojis: ['📊', '📈', '💾', '🗄️', '📉'],
  },
  {
    label: 'Dev / Code',
    emojis: ['💻', '🧪', '📜', '🔄', '🔁', '🧰'],
  },
  {
    label: 'Learning / Guide',
    emojis: ['📘', '📝', '💡', '✨', '🎯', '🔎'],
  },
  {
    label: 'Cost / Money',
    emojis: ['💰', '💵', '💸'],
  },
  {
    label: 'Alert / Warning',
    emojis: ['⚡', '💥', '🚩', '⚠️'],
  },
];

// Flat preset set for membership checks
const PRESET_SET = new Set(EMOJI_GROUPS.flatMap((g) => g.emojis));

/**
 * Controlled emoji dropdown.
 *
 * @param {object}   props
 * @param {string}   props.value      Current icon value (emoji or any short string).
 * @param {function} props.onChange   Called with the new icon string on select.
 * @param {string}   [props.className] Optional class applied to the <select>.
 * @param {string}   [props.id]        Optional id for label htmlFor pairing.
 * @param {string}   [props.ariaLabel] Optional aria-label; defaults to "Icon".
 */
export default function EmojiPicker({ value, onChange, className, id, ariaLabel }) {
  const current = value || '';
  const isCustom = current && !PRESET_SET.has(current);

  return (
    <select
      id={id}
      aria-label={ariaLabel || 'Icon'}
      className={className}
      value={current}
      onChange={(e) => onChange(e.target.value)}
    >
      {/* Preserve a pre-existing custom emoji so editing a post never drops it. */}
      {isCustom && (
        <option value={current} disabled>
          {current} (keep)
        </option>
      )}
      {!current && (
        <option value="" disabled>
          — Choose an icon —
        </option>
      )}
      {EMOJI_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.emojis.map((e) => (
            <option key={e} value={e}>
              {e}  {group.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
