/**
 * Given a DecisionResponse (from the backend), returns the top two options by vote count,
 * plus their share of total votes as whole-number percentages that sum to 100.
 * Falls back to a 0/0 or 50/50-safe split when there are no votes yet.
 */
export function topTwo(decision) {
  const options = [...(decision.options || [])].sort((a, b) => b.voteCount - a.voteCount);
  const a = options[0];
  const b = options[1];
  const total = (a?.voteCount || 0) + (b?.voteCount || 0);

  let pctA = 0;
  let pctB = 0;
  if (total > 0) {
    pctA = Math.round(((a?.voteCount || 0) / total) * 100);
    pctB = 100 - pctA;
  }

  return { a, b, pctA, pctB };
}

export function categoryColorClass() {
  // category color is driven entirely by CSS (--teal accent); kept for future per-category theming
  return "cat";
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units = [
    ["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function notificationInitials(item) {
  if (!item) return "DH";
  if (item.actorName || item.senderName) {
    return getInitials(item.actorName || item.senderName);
  }
  const msg = String(item.message || "").trim();
  const actorMatch = msg.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:and\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+)?(?:invited|commented|shared|added|voted|replied|created|updated)/);
  if (actorMatch) {
    return getInitials(actorMatch[1]);
  }
  const typeMap = {
    VOTE: "VT",
    COMMENT: "CM",
    COMMUNITY_INVITATION: "CI",
    SYSTEM: "SY",
    GENERAL: "DH",
  };
  return typeMap[item.type] || getInitials(msg);
}

export const CURATED_AVATARS = {
  "System Admin": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "Harish": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "Maya Patel": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "Arjun Mehta": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "Priya Nair": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "Rohan Shah": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  "Sarah Chen": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "Devon Vance": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
};

export function getAvatarUrl(name = "", customAvatar = "") {
  if (customAvatar && String(customAvatar).trim()) {
    return customAvatar.trim();
  }
  const cleanName = String(name || "").trim();
  if (!cleanName) return "";

  for (const [key, url] of Object.entries(CURATED_AVATARS)) {
    if (
      cleanName.toLowerCase() === key.toLowerCase() ||
      cleanName.toLowerCase().startsWith(key.toLowerCase()) ||
      key.toLowerCase().startsWith(cleanName.toLowerCase())
    ) {
      return url;
    }
  }

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=00897b,0284c7,7c3aed,d97706`;
}
