import React, { useState, useEffect } from "react";

const Typewriter = ({ text, delay, infinite }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timeout;
    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
    } else if (infinite) {
      setTimeout(() => {
        setCurrentIndex(0);
        setCurrentText("");
      }, [3000]);
    }
    return () => clearTimeout(timeout);
  }, [currentIndex, delay, text, infinite]);

  return <span>{currentText}</span>;
};

export default Typewriter;
