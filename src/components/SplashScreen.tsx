import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    // Memulai animasi berbelah setelah 1.5 detik
    const splitTimer = setTimeout(() => {
      setAnimatingOut(true);
    }, 1500);

    // Menghilangkan komponen sepenuhnya dari DOM setelah 2.5 detik
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2800);

    return () => {
      clearTimeout(splitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F9F6F0] transition-opacity duration-1000 ${animatingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ perspective: '1000px' }}
    >
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 splash-container">
        {/* Latar belakang cahaya */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse-slow"></div>

        {/* Bagian Kiri Logo */}
        <div 
          className={`absolute inset-0 w-full h-full left-half-logo ${animatingOut ? 'split-left' : ''}`}
        >
          <img 
            src="/images/LOGO_LNR.png" 
            alt="LNR Logo Left" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Bagian Kanan Logo */}
        <div 
          className={`absolute inset-0 w-full h-full right-half-logo ${animatingOut ? 'split-right' : ''}`}
        >
          <img 
            src="/images/LOGO_LNR.png" 
            alt="LNR Logo Right" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
