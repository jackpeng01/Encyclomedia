import { motion, AnimatePresence } from "framer-motion";

const waveAnimation = {
  hidden: { y: 0, opacity: 0 },
  visible: (i) => ({
    y: [-5, 0], // 👀 Bounces slightly up
    opacity: 1,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeInOut" },
  }),
};

export const WaveText = ({ text, keyProp }) => {
  const words = text.split(/\s+/); // ✅ Preserves words and spaces

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={keyProp} // ✅ Ensures each instance re-renders properly
        initial="hidden"
        animate="visible"
        exit="hidden"
        style={{ display: "inline-flex", flexWrap: "wrap" }}
      >
        {words.map((word, wordIndex) => (
          <motion.span
            key={`${keyProp}-word-${wordIndex}`} // ✅ Unique key for words
            style={{ display: "inline-flex", marginRight: "8px" }}
          >
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={`${keyProp}-char-${wordIndex}-${charIndex}`} // ✅ Unique key for characters
                custom={charIndex}
                variants={waveAnimation}
                initial="hidden" // ✅ Ensures each letter starts from hidden
                animate="visible"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
};