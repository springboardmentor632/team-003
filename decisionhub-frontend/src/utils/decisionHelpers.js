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

export const CARTOON_STYLES = [
  { id: "avataaars", name: "People", emoji: "🧑‍💼" },
  { id: "bottts", name: "Robots", emoji: "🤖" },
  { id: "adventurer", name: "Adventurer", emoji: "🏹" },
  { id: "lorelei", name: "Artistic", emoji: "🎨" },
  { id: "micah", name: "Modern", emoji: "✨" },
  { id: "open-peeps", name: "Sketches", emoji: "👥" },
  { id: "fun-emoji", name: "Emoji", emoji: "😃" },
];

export const CARTOON_BG_COLORS = [
  "b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "c7f9cc", "ffccd5", "fef08a"
];

export function generateRandomCartoonAvatar(chosenStyle) {
  const styleObj = chosenStyle
    ? CARTOON_STYLES.find((s) => s.id === chosenStyle) || { id: chosenStyle }
    : CARTOON_STYLES[Math.floor(Math.random() * CARTOON_STYLES.length)];
  const style = styleObj.id;
  const randomSeed = Math.random().toString(36).substring(2, 9);
  const randomBg = CARTOON_BG_COLORS[Math.floor(Math.random() * CARTOON_BG_COLORS.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${randomSeed}&backgroundColor=${randomBg}`;
}

export const CURATED_AVATARS = {
  "Cyber Admin": "https://api.dicebear.com/7.x/bottts/svg?seed=AdminBot&backgroundColor=b6e3f4",
  "System Admin": "https://api.dicebear.com/7.x/bottts/svg?seed=AdminBot&backgroundColor=b6e3f4",
  "Harish": "https://api.dicebear.com/7.x/avataaars/svg?seed=HarishDev&backgroundColor=c0aede",
  "Maya Patel": "https://api.dicebear.com/7.x/avataaars/svg?seed=MayaLeader&backgroundColor=ffd5dc",
  "Arjun Mehta": "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMod&backgroundColor=d1d4f9",
  "Priya Sharma": "https://api.dicebear.com/7.x/micah/svg?seed=PriyaDesigner&backgroundColor=ffdfbf",
  "Priya": "https://api.dicebear.com/7.x/micah/svg?seed=PriyaDesigner&backgroundColor=ffdfbf",
  "Priya Nair": "https://api.dicebear.com/7.x/micah/svg?seed=PriyaDesigner&backgroundColor=ffdfbf",
  "Rohan Shah": "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanArchitect&backgroundColor=c7f9cc",
  "Sarah Chen": "https://api.dicebear.com/7.x/lorelei/svg?seed=SarahAnalyst&backgroundColor=d1d4f9",
  "Devon Vance": "https://api.dicebear.com/7.x/open-peeps/svg?seed=DevonVance&backgroundColor=ffccd5",
  "Marcus Vance": "https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusVance&backgroundColor=b6e3f4",
  "Sparky": "https://api.dicebear.com/7.x/fun-emoji/svg?seed=SparkySmile&backgroundColor=fef08a",
};

export function getAvatarUrl(name = "", customAvatar = "") {
  if (customAvatar && String(customAvatar).trim()) {
    return customAvatar.trim();
  }
  const cleanName = String(name || "").trim().toLowerCase();
  if (!cleanName) return "";

  // 1. Direct or substring match
  for (const [key, url] of Object.entries(CURATED_AVATARS)) {
    const k = key.toLowerCase();
    if (cleanName === k || cleanName.includes(k) || k.includes(cleanName)) {
      return url;
    }
  }

  // 2. First name match (e.g. 'priya' from 'priya@...' or 'Priya S')
  const firstName = cleanName.split(/[\s@._-]+/)[0];
  if (firstName && firstName.length >= 3) {
    for (const [key, url] of Object.entries(CURATED_AVATARS)) {
      const kFirst = key.toLowerCase().split(/\s+/)[0];
      if (firstName === kFirst) {
        return url;
      }
    }
  }

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
