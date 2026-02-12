import React from 'react';

const clients = [
  "https://www.inaya.ae/wp-content/uploads/2018/02/client24.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client23.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client22.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client26-1.jpg",
  "https://www.inaya.ae/wp-content/uploads/2019/06/badr.jpg",
  "https://www.inaya.ae/wp-content/uploads/2019/06/reel.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client1.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client2.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client3.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client4.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client5.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/02/client25-1.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client8.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client16.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client15.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client14.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client12.jpg",
  "https://www.inaya.ae/wp-content/uploads/2018/01/client11.jpg",
];

export default function ClientsCarousel() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Clients</h2>
        <div className="overflow-hidden">
          <div className="flex animate-scroll gap-8">
            {[...clients, ...clients].map((src, idx) => (
              <div key={idx} className="flex-shrink-0 w-28 h-20 bg-slate-50 rounded-lg flex items-center justify-center p-3">
                <img src={src} alt="Client" className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}