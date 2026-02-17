import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

const FALLBACK_STORE_RANK_ART = "/Images/store/Store_Ranks.png";
const STORE_RANK_ART_BY_ID = {
  "rank-hero": "/Images/Donor_Rank_Imgs/Hero.png",
  "rank-legend": "/Images/Donor_Rank_Imgs/Legend.png",
  "rank-mythic": "/Images/Donor_Rank_Imgs/Mythic.png",
};

function StoreRankArt({
  rankId = "",
  className = "",
  alt = "",
  ariaHidden = true,
  loading = "lazy",
}) {
  const normalizedRankId = String(rankId || "").trim().toLowerCase();
  const src = STORE_RANK_ART_BY_ID[normalizedRankId] || FALLBACK_STORE_RANK_ART;
  return html`<img
    className=${className}
    src=${src}
    alt=${alt}
    aria-hidden=${ariaHidden ? "true" : undefined}
    loading=${loading}
  />`;
}

export default React.memo(StoreRankArt);
