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
