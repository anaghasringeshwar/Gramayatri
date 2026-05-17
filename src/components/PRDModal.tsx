import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { motion } from 'motion/react';

interface PRDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PRDModal({ isOpen, onClose }: PRDModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Toolbar */}
        <div className="bg-slate-50 border-b p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3 text-slate-700">
            <FileText size={20} className="text-emerald-600" />
            <span className="font-bold text-sm tracking-tight">PRD - Grama-Yatri.pdf</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <Printer size={16} />
              SAVE AS PDF
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-white text-slate-900 font-serif leading-relaxed print:p-0 print:overflow-visible">
          <div className="max-w-2xl mx-auto">
            <div className="border-b-4 border-emerald-600 pb-8 mb-12">
              <h1 className="text-5xl font-black font-sans leading-tight text-slate-900 mb-2">Grama-Yatri</h1>
              <p className="text-xl text-emerald-700 font-sans font-medium uppercase tracking-[0.2em]">Product Requirement Document</p>
              <div className="mt-8 flex gap-8 text-xs font-sans font-bold text-slate-400">
                <div>VERSION 1.0</div>
                <div>CREATED: MAY 2026</div>
                <div>DOMAIN: RURAL TRANSIT</div>
              </div>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-sans font-black uppercase tracking-tighter mb-4 text-emerald-900">1. Executive Summary</h2>
              <p className="mb-4">
                Grama-Yatri is a community-driven bus tracking application designed to solve the problem of unreliable bus timings in rural areas. By leveraging crowdsourced "pings" from passengers currently on the bus, the app provides real-time location data and estimated time of arrival (ETA) for other commuters waiting at stops.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-sans font-black uppercase tracking-tighter mb-4 text-emerald-900">2. Problem Statement</h2>
              <p className="mb-4">
                In rural India, public transport is the lifeblood of the community, yet it remains digitally invisible:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Fixed schedules are rarely followed or updated.</li>
                <li>Digital maps lack granular data for village routes.</li>
                <li>Commuters spend up to 60 minutes waiting at stops due to lack of information.</li>
                <li>No official GPS tracking exists for secondary-route buses.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-sans font-black uppercase tracking-tighter mb-4 text-emerald-900">3. Target Audience</h2>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 font-sans">
                  <p className="font-black text-xs text-emerald-800 uppercase mb-1">Waiters</p>
                  <p className="text-sm text-emerald-700 italic leading-snug">Commuters at bus stops looking for bus locations.</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 font-sans">
                  <p className="font-black text-xs text-emerald-800 uppercase mb-1">Riders</p>
                  <p className="text-sm text-emerald-700 italic leading-snug">Passengers on board acts as contributors by updating position.</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-sans font-black uppercase tracking-tighter mb-4 text-emerald-900">4. Key Features</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-black mb-2 text-slate-800">4.1 Crowdsourced Tracking (The "Ping" System)</h3>
                  <p>A real-time synchronization layer where passengers on board broadcast their coordinates. This data is instantly pushed to Firebase Firestore and propagated to waiting users.</p>
                </div>
                <div>
                  <h3 className="font-black mb-2 text-slate-800">4.2 Live Route Visualization</h3>
                  <p>Utilizing Google Maps Platform to overlay high-fidelity route polylines and dynamic stop markers, ensuring villagers can identify the bus's progress against the official path.</p>
                </div>
                <div>
                  <h3 className="font-black mb-2 text-slate-800">4.3 Real-time ETA Engine</h3>
                  <p>A custom-built algorithm that calculates geographic distance between the latest "Ping" and the user's nearest stop, providing dynamic arrival predictions.</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-sans font-black uppercase tracking-tighter mb-4 text-emerald-900">5. Technical Stack</h2>
              <div className="grid grid-cols-2 gap-y-2 text-sm font-sans">
                <div className="font-bold text-slate-500 uppercase">Frontend</div>
                <div className="font-bold">React 18, TypeScript</div>
                <div className="font-bold text-slate-500 uppercase">Styling</div>
                <div className="font-bold">Tailwind CSS, Framer Motion</div>
                <div className="font-bold text-slate-500 uppercase">Database/Real-time</div>
                <div className="font-bold">Firebase Firestore</div>
                <div className="font-bold text-slate-500 uppercase">Authentication</div>
                <div className="font-bold">Google Cloud Identity</div>
                <div className="font-bold text-slate-500 uppercase">Maps</div>
                <div className="font-bold">Google Maps Platform</div>
              </div>
            </section>

            <div className="mt-24 pt-8 border-t text-center text-[10px] uppercase tracking-widest font-sans font-bold text-slate-300">
              End of Document &copy; 2026 Grama-Yatri Systems
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
