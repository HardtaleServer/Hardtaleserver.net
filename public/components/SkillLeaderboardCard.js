import React, { useMemo } from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

const SKILL_CONFIG = {
  swords: { enabled: true },
  axes: { enabled: true },
  daggers: { enabled: true },
  staves: { enabled: true },
  defense: { enabled: true },
  mining: { enabled: true },
  woodcutting: { enabled: true },
  harvesting: { enabled: true },
  acrobatics: { enabled: false },
  taming: { enabled: false },
  fishing: { enabled: false },
  building: { enabled: false },
  repair: { enabled: false },
  alchemy: { enabled: false },
  enchanting: { enabled: false },
  cooking: { enabled: false },
  smithing: { enabled: false },
};

const FAKE_SKILL_BOARD = [
  { name: "Smurfis", skills: { swords: 1420, axes: 1300, defense: 1480, mining: 1100, woodcutting: 980, harvesting: 920, daggers: 1260, staves: 1010 } },
  { name: "Hardtale", skills: { swords: 1340, axes: 1170, defense: 1400, mining: 1060, woodcutting: 940, harvesting: 880, daggers: 1100, staves: 980 } },
  { name: "Aerin", skills: { swords: 920, axes: 1040, defense: 980, mining: 1210, woodcutting: 1140, harvesting: 1020, daggers: 900, staves: 860 } },
  { name: "Nyx", skills: { swords: 980, axes: 860, defense: 930, mining: 820, woodcutting: 790, harvesting: 840, daggers: 1240, staves: 1330 } },
  { name: "Kairo", skills: { swords: 760, axes: 790, defense: 820, mining: 1280, woodcutting: 1260, harvesting: 1180, daggers: 700, staves: 650 } },
];

function toTitle(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function SkillLeaderboardCard({ iconSrc = "/Images/SVGs/ui/Leaderboard_SVG.svg" }) {
  const { rows, enabledCount } = useMemo(() => {
    const enabledSkills = Object.entries(SKILL_CONFIG)
      .filter(([, config]) => config?.enabled === true)
      .map(([key]) => key);
    const calculated = FAKE_SKILL_BOARD.map((entry) => {
      const scoped = enabledSkills.map((skill) => [skill, Number(entry?.skills?.[skill] || 0)]);
      const totalXp = scoped.reduce((sum, [, value]) => sum + value, 0);
      const [topSkill, topValue] = scoped.sort((a, b) => b[1] - a[1])[0] || ["swords", 0];
      return {
        name: String(entry?.name || "Player"),
        totalXp,
        topSkill: toTitle(topSkill),
        topValue,
      };
    })
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 5);
    return {
      rows: calculated,
      enabledCount: enabledSkills.length,
    };
  }, []);

  return html`<section className="home-leaderboard-preview" aria-label="Leaderboard preview">
    <div className="home-leaderboard-head">
      <img className="home-leaderboard-icon" src=${iconSrc} alt="" aria-hidden="true" />
      <div>
        <div className="home-leaderboard-title">Leaderboard (Preview)</div>
        <div className="home-leaderboard-subtitle muted">
          Showing fake data from ${enabledCount} enabled skills.
        </div>
      </div>
    </div>
    <div className="home-leaderboard-list">
      ${rows.map(
        (row, index) => html`<div key=${row.name} className="home-leaderboard-row">
          <span className="home-leaderboard-rank">#${index + 1}</span>
          <span className="home-leaderboard-name">${row.name}</span>
          <span className="home-leaderboard-meta">${row.topSkill}: ${row.topValue.toLocaleString()}</span>
          <span className="home-leaderboard-xp">${row.totalXp.toLocaleString()} XP</span>
        </div>`,
      )}
    </div>
  </section>`;
}

