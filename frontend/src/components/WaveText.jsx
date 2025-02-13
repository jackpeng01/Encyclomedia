import { motion } from "framer-motion";

const waveAnimation = {
  hidden: { y: 0, opacity: 0 },
  visible: (i) => ({
    y: [-5, 0], // 👀 Bounces slightly up
    opacity: 1,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeInOut" },
  }),
};

export const WaveText = ({ text }) => {
  // ✅ Split into words and preserve spaces
  const words = text.split(/\s+/); // Splits words but removes extra spaces

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      style={{ display: "inline-flex", flexWrap: "wrap" }}
    >
      {words.map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          style={{ display: "inline-flex", marginRight: "8px" }} // ✅ Ensures spacing between words
        >
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              custom={wordIndex + charIndex}
              variants={waveAnimation}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </motion.span>
  );
};
