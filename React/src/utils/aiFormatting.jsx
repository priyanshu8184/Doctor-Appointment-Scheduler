import React from 'react';

// Parse inline formatting tokens like **bold text**
export const parseInlineFormatting = (text) => {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      const matchIndex = boldMatch.index;
      if (matchIndex > 0) {
        parts.push(remaining.substring(0, matchIndex));
      }
      parts.push(
        <strong key={`b-${keyIdx++}`} className="ai-bold-text">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(matchIndex + boldMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts;
};

// Render multi-line AI messages cleanly with styled bullet points and paragraphs
export const renderFormattedMessage = (rawText) => {
  if (!rawText) return null;
  const lines = rawText.split('\n');
  const elements = [];
  let currentBullets = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="ai-bullet-list">
          {currentBullets.map((bText, idx) => (
            <li key={idx} className="ai-bullet-item">
              <span className="ai-bullet-dot">•</span>
              <span className="ai-bullet-content">{parseInlineFormatting(bText)}</span>
            </li>
          ))}
        </ul>
      );
      currentBullets = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets();
      return;
    }

    // Identify bullet items: starts with •, -, or * followed by a space
    if (trimmed.startsWith('•') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'))) {
      const cleaned = trimmed.replace(/^[•\-\*]\s*/, '');
      currentBullets.push(cleaned);
    } else {
      flushBullets();
      elements.push(
        <p key={`p-${lineIdx}`} className="ai-msg-paragraph">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushBullets();
  return elements;
};

export const formatSlotDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};
