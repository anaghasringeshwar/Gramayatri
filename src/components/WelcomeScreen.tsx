import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Languages } from 'lucide-react';
import { Language, LocalUser } from '../types';

interface WelcomeScreenProps {
  onJoin: (user: LocalUser) => void;
}

export default function WelcomeScreen({ onJoin }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language>('en');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin({ name: name.trim(), language });
    }
  };

  return (
    <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 text-slate-900 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400" />
        
        <div className="flex flex-col items-center text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Languages size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-tight mb-1">
            Grama-Yatri
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {language === 'en' ? 'Community Rural Transit' : 'ಸಮುದಾಯ ಗ್ರಾಮೀಣ ಸಾರಿಗೆ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">
              {language === 'en' ? 'Select Language' : 'ಭಾಷೆಯನ್ನು ಆರಿಸಿ'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-3 rounded-xl font-bold transition-all border-2 ${
                  language === 'en' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`py-3 rounded-xl font-bold transition-all border-2 ${
                  language === 'kn' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">
              {language === 'en' ? 'Your Name' : 'ನಿಮ್ಮ ಹೆಸರು'}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'en' ? "Enter your name..." : "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 mt-4"
          >
            {language === 'en' ? 'Start Journey' : 'ಪ್ರಯಾಣ ಆರಂಭಿಸಿ'}
          </button>
        </form>

        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-tight mt-8">
          No sign-in required • Verified by Community
        </p>
      </motion.div>
    </div>
  );
}
