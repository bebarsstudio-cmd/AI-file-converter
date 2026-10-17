"use client";

import { useState, useEffect } from "react";

const phrases = [
  "Transform Your Files",
  "Convert Your Projects",
  "Preserve What Matters",
  "Build Something Better",
];

export default function Hero() {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-in-up text-center space-y-4">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gradient">
  1devv
</h1>
      <div className="h-10 flex items-center justify-center overflow-hidden">
        <p 
          key={currentPhrase} 
          className="text-lg md:text-xl text-gray-400 animate-fade-slide"
        >
          {phrases[currentPhrase]}
        </p>
      </div>
    </div>
  );
}
