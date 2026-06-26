import React from 'react';
import { User } from 'lucide-react';

/**
 * Avatar — single source of truth for rendering any user's profile picture.
 *
 * Props:
 *   src      {string}  — URL of the user's avatar photo (user.avatar from backend).
 *                        If falsy, renders the neutral fallback icon.
 *   name     {string}  — Used as the <img> alt text when a real photo is shown.
 *   size     {number}  — Width/height in pixels (default: 32).
 *   className {string} — Extra classes applied to the outer wrapper (e.g. border styles).
 *
 * Rules:
 *   - Real photo  → shows the <img> exactly as before (works for Google avatars and any future upload).
 *   - No photo    → mist-background circle with a forest-coloured User icon — no gender, no illustration.
 */
export default function Avatar({ src, name = 'User', size = 32, className = '' }) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  // Neutral fallback: mist circle + forest User icon
  const iconSize = Math.round(size * 0.55); // icon is ~55% of container
  return (
    <div
      style={style}
      className={`rounded-full bg-mist flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <User style={{ width: iconSize, height: iconSize }} className="text-forest" />
    </div>
  );
}
