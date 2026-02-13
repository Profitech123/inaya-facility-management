import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/97148827001?text=Hello%2C%20I%27d%20like%20to%20inquire%20about%20INAYA%20services."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[152px] lg:bottom-24 right-6 z-[9998] w-14 h-14 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full shadow-xl shadow-green-600/30 flex items-center justify-center transition-all hover:scale-105"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
