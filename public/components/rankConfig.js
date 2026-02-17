const RANK_ICON_BY_LABEL = {
  unregistered: "unlinked",
  unlinked: "unlinked",
  registered: "linked",
  linked: "linked",
  hero: "hero",
  legend: "crown",
  mythic: "star",
  moderator: "mod",
  mod: "mod",
};

const RANK_DISPLAY_BY_LABEL = {
  unregistered: "Unlinked",
  unlinked: "Unlinked",
  registered: "Linked",
  linked: "Linked",
};

export function getRankIconType(label) {
  const normalized = String(label || "").trim().toLowerCase();
  return RANK_ICON_BY_LABEL[normalized] || "";
}

export function getRankDisplayLabel(label) {
  const raw = String(label || "").trim();
  const normalized = raw.toLowerCase();
  if (RANK_DISPLAY_BY_LABEL[normalized]) return RANK_DISPLAY_BY_LABEL[normalized];
  return raw || "Unlinked";
}
