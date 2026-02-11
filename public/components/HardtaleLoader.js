import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

const imageMap = {
  fiery: "/assets/HardTale_H_Fiery.png",
  golden: "/assets/HardTale_H_Golden.png",
  greyscale: "/assets/HardTale_H_GreyScale.png",
  icey: "/assets/HardTale_H_Icey.png",
};

const glowClassMap = {
  fiery: "h-glow-fiery",
  golden: "h-glow-golden",
  greyscale: "h-glow-greyscale",
  icey: "h-glow-icey",
};

export default function HardtaleLoader({ variant = "fiery" }) {
  const imageSrc = imageMap[variant] || imageMap.fiery;
  const glowClass = glowClassMap[variant] || glowClassMap.fiery;

  return html`
    <div className="hardtale-loader-wrapper">
      <img
        src=${imageSrc}
        alt="Hardtale Loading"
        className=${`hardtale-loader ${glowClass}`}
      />
    </div>
  `;
}
