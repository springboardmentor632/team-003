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
