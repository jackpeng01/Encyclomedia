import { motion } from "framer-motion";

const colors = [
  "hue-rotate(0deg) saturate(2)", // Default with high saturation
  "hue-rotate(90deg) saturate(2.5)", // More intense shift
  "hue-rotate(180deg) saturate(3)", // Stronger blue shift
];

const LogoRow = () => {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {colors.map((filter, index) => (
        <motion.img
          key={index}
          src="/encyclomediaglobe.png"
          alt="Logo"
          width="60"
          height="50"
          style={{
            opacity: 0.7, // Slightly more visible
            filter, // Apply stronger tints
          }}
        />
      ))}
    </div>
  );
};

export default LogoRow;
