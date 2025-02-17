import React, { useState } from "react";
import { motion } from "framer-motion";

const footnotes = [
  {
    id: "fn1",
    symbol: "*",
    text: "That's right. No disclaimers.",
    trigger: "Sue us.†",
  },
  {
    id: "fn2",
    symbol: "†",
    text: "Just messin' around. You weren't actually thinking about suing... right?",
    trigger: "Fine, then explain this.††",
  },
  {
    id: "fn2",
    symbol: "††",
    text: "Alright I can explain",
    trigger: "I'm listening. ¶",
  },
  {
    id: "fn3",
    symbol: "¶",
    text: "Let's just calm down a bit",
    trigger: "I'm calling my lawyer.§",
  },
  {
    id: "fn4",
    symbol: "§",
    text: "Boy, these footers sure are neat, huh? Look at all these cool symbols! ≈ç√∫˜µ≤≥÷åß∂ƒ©˙∆˚¬…æœ∑´®´∑†¥¨ˆøπ“‘∏ÒÂ˜◊Ç˛¡™£¢∞§¶•",
    trigger: "Yep, very cool. Still suing. ||",
  },
  {
    id: "fn4",
    symbol: "||",
    text: "Let me start over",
    trigger: "I'm calling my lawyer. #",
  },
  {
    id: "fn4",
    symbol: "#",
    text: "I'm running out of symbols here, just gimme a sec.",
    trigger: "You will be hearing from my lawyer very, very soon. **",
  },
  {
    id: "fn4",
    symbol: "**",
    text: "Whoa, that's weird... All of your problems are magically disappearing!",
  }, // ✅ Fixed duplicate ID
];

const LandingPageFooter = ({ showFootnotes }) => {
  const [visibleFootnotes, setVisibleFootnotes] = useState([true]);
  const [fadeOutFooter, setFadeOutFooter] = useState(false);
  const [index, setIndex] = useState(0);

  if (!showFootnotes) return null; // ✅ Don't render unless needed

  const handleShowNextFootnote = () => {
    if (index + 2 < footnotes.length) {
      // Show the next footnote
      setVisibleFootnotes((prev) => {
        const updated = [...prev];
        updated[index + 1] = true;
        return updated;
      });
    } else {
      // Last footnote clicked → Fade out entire footer
      setFadeOutFooter(true);
      setVisibleFootnotes((prev) => {
        const updated = [...prev];
        updated[index + 1] = true;
        return updated;
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={fadeOutFooter ? { opacity: 0 } : { opacity: 1, y: 0 }}
      transition={{
        duration: fadeOutFooter ? 4 : 1,
        ease: "easeInOut",
        delay: fadeOutFooter ? 3 : 0,
      }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: fadeOutFooter ? "white" : "rgba(255, 255, 255, 0.9)",
        padding: "10px 20px",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <motion.p
          style={{ fontSize: "14px", color: "#555", flex: 1 }}
          animate={{ opacity: fadeOutFooter ? 0 : 1 }}
          transition={{ duration: fadeOutFooter ? 4 : 0.4, ease: "easeOut" }}
        >
          <strong>{footnotes[0].symbol}</strong> {footnotes[0].text}{" "}
        </motion.p>

        <motion.p
          style={{ fontSize: "14px", color: "#555", textAlign: "center" }}
          animate={{ opacity: fadeOutFooter ? 0 : 1 }}
          transition={{ duration: fadeOutFooter ? 4 : 0.4, ease: "easeOut" }}
        >
          By reading this, you consent to having your data sold on the dark web
          and forfeit legal ownership of your left kidney. Copyright ©{" "}
          {new Date().getFullYear()} Encyclomedia. All rights reserved.
        </motion.p>
      </div>

      {/* Dynamically render additional footnotes */}
      {footnotes.slice(1, -1).map((footnote, index) =>
        visibleFootnotes[index + 1] ? (
          <motion.div
            key={footnote.id}
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: fadeOutFooter ? 0 : 1, y: 0 }}
              transition={{
                duration: fadeOutFooter ? 4 : 0.4,
                ease: "easeOut",
              }}
              style={{
                fontSize: "14px",
                color: "#555",
                margin: "5px 0",
                display: "inline",
              }}
            >
              <strong>{footnote.symbol}</strong> {footnote.text}
            </motion.p>

            {/* Trigger appears slightly later */}
            {/* <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: fadeOutFooter ? 0 : 1 }}
              transition={{
                duration: fadeOutFooter ? 4 : 0.4,
                ease: "easeOut",
                delay: 1,
              }} // ✅ Delay trigger
              style={{
                display: "inline",
                fontSize: "14px",
                marginLeft: "14px",
                marginTop: "5px",
                textDecoration: "underline",
                color: "blue",
                cursor: "pointer",
                opacity: index + 2 < footnotes.length ? 1 : 0.5,
              }}
              onClick={() => handleShowNextFootnote(index + 1)}
            >
              {footnote.trigger}
            </motion.span> */}
          </motion.div>
        ) : null
      )}

      {/* Last footnote stays visible */}
      {visibleFootnotes[footnotes.length - 1] && (
        <motion.p
          key={footnotes[footnotes.length - 1].id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }} // ✅ Ensures it always remains visible
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ fontSize: "14px", color: "#555", margin: "5px 0" }}
        >
          <strong>{footnotes[footnotes.length - 1].symbol}</strong>{" "}
          {footnotes[footnotes.length - 1].text}{" "}
          {/* <span
            style={{
              marginTop: "5px",
              textDecoration: "underline",
              color: "blue",
              cursor: "pointer",
            }}
          >
            {footnotes[footnotes.length - 1].trigger}
          </span> */}
        </motion.p>
      )}
      <span
        style={{
          marginTop: "5px",
          textDecoration: "underline",
          color: "blue",
          cursor: "pointer",
        }}
        onClick={() => {
          handleShowNextFootnote();
          setIndex((prev) => prev + 1);
        }}
      >
        {footnotes[index].trigger}
      </span>
    </motion.div>
  );
};

export default LandingPageFooter;
