import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import lnrLogo from "@/assets/logo.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 pt-4 sm:pt-6 pointer-events-none">
      <div className="mx-auto flex max-w-6xl flex-col rounded-[2rem] bg-white/95 backdrop-blur-md shadow-xl border-2 border-black pointer-events-auto transition-all overflow-hidden">
        
        {/* Main Navbar Bar */}
        <div className="flex items-center justify-between px-6 md:px-10 py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity" onClick={() => setIsOpen(false)}>
            <img src={lnrLogo} alt="LNR Coffee Logo" className="size-10 rounded-full object-cover border border-neutral-200 bg-white" />
            <span className="font-display text-xl font-bold tracking-tight text-neutral-900 italic">
              Lnr Coffee Shop
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden gap-8 text-sm font-bold uppercase tracking-wider md:flex">
            <Link to="/" className="text-neutral-600 hover:text-[#3c2419] transition-colors">Beranda</Link>
            <Link to="/tentang" className="text-neutral-600 hover:text-[#3c2419] transition-colors">Tentang</Link>
            <Link to="/menu" className="text-neutral-600 hover:text-[#3c2419] transition-colors">Menu</Link>
            <Link to="/lokasi" className="text-neutral-600 hover:text-[#3c2419] transition-colors">Lokasi</Link>
            <Link to="/testimoni" className="text-neutral-600 hover:text-[#3c2419] transition-colors">Testimoni</Link>
          </nav>
          
          {/* Spacer for desktop to keep logo centered if needed, or just hidden on mobile */}
          <div className="hidden md:block w-[140px]"></div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden border-t-2 border-black/10 bg-white/50 px-6 py-4 flex flex-col gap-4 text-sm font-bold uppercase tracking-wider">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-neutral-700 hover:text-[#3c2419] transition-colors">Beranda</Link>
            <Link to="/tentang" onClick={() => setIsOpen(false)} className="text-neutral-700 hover:text-[#3c2419] transition-colors">Tentang</Link>
            <Link to="/menu" onClick={() => setIsOpen(false)} className="text-neutral-700 hover:text-[#3c2419] transition-colors">Menu</Link>
            <Link to="/lokasi" onClick={() => setIsOpen(false)} className="text-neutral-700 hover:text-[#3c2419] transition-colors">Lokasi</Link>
            <Link to="/testimoni" onClick={() => setIsOpen(false)} className="text-neutral-700 hover:text-[#3c2419] transition-colors">Testimoni</Link>
          </div>
        )}
      </div>
    </header>
  );
}
