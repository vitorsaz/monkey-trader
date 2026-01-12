'use client';

import React, { useState, useEffect } from 'react';

// Custom Paint-style icons (no emojis!)
const PaintIcons = {
  banana: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block">
      <path d="M5 18 Q3 12 8 6 Q12 3 18 5 Q16 8 14 12 Q12 16 6 18 Z" fill="#FFD93D" stroke="#5D4E37" strokeWidth="2"/>
    </svg>
  ),
  star: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block animate-wiggle">
      <path d="M12 2 L14 9 L21 9 L16 14 L18 21 L12 17 L6 21 L8 14 L3 9 L10 9 Z" fill="#FFD93D" stroke="#5D4E37" strokeWidth="1.5"/>
    </svg>
  ),
  heart: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block">
      <path d="M12 21 Q4 14 4 9 Q4 4 9 4 Q12 4 12 7 Q12 4 15 4 Q20 4 20 9 Q20 14 12 21" fill="#FF6B6B" stroke="#5D4E37" strokeWidth="1.5"/>
    </svg>
  ),
  coin: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block">
      <circle cx="12" cy="12" r="9" fill="#FFD93D" stroke="#5D4E37" strokeWidth="2"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#5D4E37">$</text>
    </svg>
  ),
  monkey: () => (
    <svg viewBox="0 0 32 32" className="w-8 h-8 inline-block">
      <ellipse cx="16" cy="16" rx="10" ry="11" fill="#A89078" stroke="#5D4E37" strokeWidth="2"/>
      <ellipse cx="16" cy="17" rx="7" ry="8" fill="#FFF5E6" stroke="#5D4E37" strokeWidth="1.5"/>
      <circle cx="6" cy="14" r="3" fill="#A89078" stroke="#5D4E37" strokeWidth="1.5"/>
      <circle cx="26" cy="14" r="3" fill="#A89078" stroke="#5D4E37" strokeWidth="1.5"/>
      <circle cx="13" cy="14" r="1.5" fill="#5D4E37"/>
      <circle cx="19" cy="14" r="1.5" fill="#5D4E37"/>
      <path d="M14 18 Q16 19 18 18" stroke="#5D4E37" strokeWidth="1.5" fill="none"/>
      <circle cx="10" cy="17" r="2.5" fill="#FFB5B5"/>
      <circle cx="22" cy="17" r="2.5" fill="#FFB5B5"/>
    </svg>
  ),
  up: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block">
      <path d="M12 4 L20 16 L4 16 Z" fill="#4ADE80" stroke="#166534" strokeWidth="1.5"/>
    </svg>
  ),
  down: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block">
      <path d="M12 20 L20 8 L4 8 Z" fill="#F87171" stroke="#991B1B" strokeWidth="1.5"/>
    </svg>
  ),
  eye: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block">
      <ellipse cx="12" cy="12" rx="9" ry="6" fill="#FFF5E6" stroke="#5D4E37" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" fill="#5D4E37"/>
      <circle cx="13" cy="11" r="1" fill="#FFF"/>
    </svg>
  ),
  copy: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block">
      <rect x="8" y="8" width="12" height="14" rx="2" fill="#FFF5E6" stroke="#5D4E37" strokeWidth="2"/>
      <rect x="4" y="4" width="12" height="14" rx="2" fill="#FFE4C4" stroke="#5D4E37" strokeWidth="2"/>
    </svg>
  ),
  leaf: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block">
      <path d="M12 3 Q20 8 18 16 Q14 20 8 18 Q4 14 6 8 Q8 4 12 3" fill="#86EFAC" stroke="#166534" strokeWidth="1.5"/>
      <path d="M12 3 Q10 10 8 18" stroke="#166534" strokeWidth="1" fill="none"/>
    </svg>
  )
};

// Cute frame component with rounded corners
const CuteFrame = ({ children, className = '', variant = 'default', wobble = false }: { children: React.ReactNode; className?: string; variant?: string; wobble?: boolean }) => {
  const variants: Record<string, string> = {
    default: 'bg-gradient-to-br from-[#FFAD60] to-[#FF8C42] border-[3px] border-[#5D4E37]',
    light: 'bg-gradient-to-br from-[#FFE4C4] to-[#FFD4A8] border-[3px] border-[#8B7355]',
    terminal: 'bg-gradient-to-br from-[#3D2E1F] to-[#2D2419] border-[3px] border-[#FF8C42]',
    gallery: 'bg-gradient-to-br from-[#C4956A] to-[#A87D50] border-[4px] border-[#5D4E37]',
    accent: 'bg-gradient-to-br from-[#FFD93D] to-[#FFBF00] border-[3px] border-[#8B7355]'
  };

  return (
    <div
      className={`${variants[variant]} rounded-2xl ${wobble ? 'hover:animate-wobble' : ''} ${className}`}
      style={{
        boxShadow: '4px 4px 0 rgba(93, 78, 55, 0.5), inset 0 2px 0 rgba(255,255,255,0.2)'
      }}
    >
      {children}
    </div>
  );
};

// Fake trade data
const generateFakeTrades = () => {
  const tokens = ['$BONK', '$WIF', '$POPCAT', '$MICHI', '$BOME', '$SLERF', '$MYRO', '$PONKE'];
  const trades = [];
  for (let i = 0; i < 15; i++) {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const isBuy = Math.random() > 0.3;
    const profit = isBuy ? (Math.random() * 200 - 50).toFixed(1) : null;
    trades.push({
      id: i,
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      token,
      type: isBuy ? 'BUY' : 'SELL',
      amount: (Math.random() * 0.5 + 0.01).toFixed(3),
      profit: profit,
      status: Math.random() > 0.1 ? 'OK' : 'FAIL'
    });
  }
  return trades.reverse();
};

// Fake watching tokens
const generateWatchingTokens = () => {
  const tokens = [
    { name: 'BANANA', mc: '125K', change: '+12.5', score: 78 },
    { name: 'CHIMPY', mc: '45K', change: '-3.2', score: 45 },
    { name: 'JUNGLE', mc: '890K', change: '+45.8', score: 92 },
    { name: 'VINES', mc: '23K', change: '+5.1', score: 61 },
    { name: 'TREEZ', mc: '67K', change: '-8.9', score: 33 },
    { name: 'COCO', mc: '234K', change: '+22.3', score: 85 },
  ];
  return tokens;
};

// Gallery images
const galleryImages = [
  { id: 1, title: 'macaco pensando', desc: 'analisando o mercado' },
  { id: 2, title: 'macaco feliz', desc: 'lucro de +500%' },
  { id: 3, title: 'macaco triste', desc: 'perdeu no rug' },
  { id: 4, title: 'macaco comendo', desc: 'banana break' },
  { id: 5, title: 'macaco dormindo', desc: 'mercado fechado' },
  { id: 6, title: 'macaco gritando', desc: 'TO THE MOON' },
  { id: 7, title: 'macaco zen', desc: 'hodl mode' },
  { id: 8, title: 'macaco rico', desc: 'depois do pump' },
];

export default function MonkeyTrader() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [trades, setTrades] = useState<any[]>([]);
  const [watchingTokens, setWatchingTokens] = useState<any[]>([]);
  const [caInput, setCaInput] = useState('');
  const [monkeyMood, setMonkeyMood] = useState('NORMAL');
  const [totalPnl, setTotalPnl] = useState('+127.5%');
  const [blinkEyes, setBlinkEyes] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    setTrades(generateFakeTrades());
    setWatchingTokens(generateWatchingTokens());

    // Blink animation
    const blinkInterval = setInterval(() => {
      setBlinkEyes(true);
      setTimeout(() => setBlinkEyes(false), 150);
    }, 3000);

    // Bounce animation
    const bounceInterval = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(bounceInterval);
    };
  }, []);

  const moods: Record<string, { color: string; desc: string; bg: string }> = {
    'EUFORICO': { color: '#4ADE80', desc: 'achei banana de ouro!!', bg: 'from-green-400 to-green-500' },
    'FELIZ': { color: '#86EFAC', desc: 'hoje ta bom demais', bg: 'from-green-300 to-green-400' },
    'NORMAL': { color: '#FBBF24', desc: 'bora trabalhar ne', bg: 'from-yellow-400 to-orange-400' },
    'NERVOSO': { color: '#FB923C', desc: 'esse mercado ta doido', bg: 'from-orange-400 to-orange-500' },
    'PANICO': { color: '#F87171', desc: 'AAAAAAAA', bg: 'from-red-400 to-red-500' }
  };

  // Big Monkey SVG component
  const BigMonkey = () => (
    <svg viewBox="0 0 200 220" className={`w-full max-w-[100px] transition-transform duration-300 ${bounce ? 'scale-105' : 'scale-100'}`}>
      {/* Shadow */}
      <ellipse cx="100" cy="210" rx="50" ry="8" fill="rgba(0,0,0,0.15)"/>

      {/* Body */}
      <ellipse cx="100" cy="175" rx="50" ry="40" fill="#A89078" stroke="#5D4E37" strokeWidth="3"/>

      {/* Bandana */}
      <path d="M50 155 Q100 140 150 155 Q150 168 100 162 Q50 168 50 155" fill="#FF5555" stroke="#5D4E37" strokeWidth="2"/>
      <path d="M150 155 Q162 148 175 158 Q168 166 155 162" fill="#FF5555" stroke="#5D4E37" strokeWidth="2"/>
      <path d="M175 158 Q188 152 195 165" fill="#FF5555" stroke="#5D4E37" strokeWidth="2"/>

      {/* Head */}
      <ellipse cx="100" cy="90" rx="70" ry="75" fill="#A89078" stroke="#5D4E37" strokeWidth="3"/>

      {/* Face */}
      <ellipse cx="100" cy="100" rx="50" ry="55" fill="#FFF5E6" stroke="#5D4E37" strokeWidth="2"/>

      {/* Ears */}
      <ellipse cx="25" cy="80" rx="20" ry="22" fill="#A89078" stroke="#5D4E37" strokeWidth="3"/>
      <ellipse cx="25" cy="80" rx="12" ry="14" fill="#FFB5B5"/>
      <ellipse cx="175" cy="80" rx="20" ry="22" fill="#A89078" stroke="#5D4E37" strokeWidth="3"/>
      <ellipse cx="175" cy="80" rx="12" ry="14" fill="#FFB5B5"/>

      {/* Eyes */}
      {!blinkEyes ? (
        <>
          <ellipse cx="70" cy="85" rx="14" ry="16" fill="#FFF" stroke="#5D4E37" strokeWidth="2"/>
          <ellipse cx="130" cy="85" rx="14" ry="16" fill="#FFF" stroke="#5D4E37" strokeWidth="2"/>
          <circle cx="73" cy="85" r="7" fill="#5D4E37"/>
          <circle cx="133" cy="85" r="7" fill="#5D4E37"/>
          <circle cx="75" cy="82" r="3" fill="#FFF"/>
          <circle cx="135" cy="82" r="3" fill="#FFF"/>
        </>
      ) : (
        <>
          <path d="M56 85 Q70 92 84 85" stroke="#5D4E37" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M116 85 Q130 92 144 85" stroke="#5D4E37" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </>
      )}

      {/* Nose */}
      <ellipse cx="100" cy="110" rx="10" ry="7" fill="#C4A07A" stroke="#5D4E37" strokeWidth="2"/>

      {/* Mouth */}
      <path d="M80 130 Q100 145 120 130" stroke="#5D4E37" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* Cheeks */}
      <circle cx="55" cy="115" r="18" fill="#FFB5B5" opacity="0.8"/>
      <circle cx="145" cy="115" r="18" fill="#FFB5B5" opacity="0.8"/>

      {/* Blush lines */}
      <g stroke="#FF9999" strokeWidth="1.5" opacity="0.6">
        <path d="M45 110 L50 112"/>
        <path d="M45 115 L52 117"/>
        <path d="M45 120 L50 122"/>
        <path d="M150 110 L155 112"/>
        <path d="M148 115 L155 117"/>
        <path d="M150 120 L155 122"/>
      </g>
    </svg>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 font-mono">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 animate-float-slow opacity-20">
          <PaintIcons.banana />
        </div>
        <div className="absolute top-32 right-20 animate-float-medium opacity-20">
          <PaintIcons.star />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float-slow opacity-20">
          <PaintIcons.leaf />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-5">
          <CuteFrame variant="light" className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="animate-bounce-slow">
                  <PaintIcons.monkey />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#5D4E37] tracking-tight flex items-center gap-2">
                    MONKEY TRADER
                    <span className="inline-block animate-wiggle"><PaintIcons.banana /></span>
                  </h1>
                  <p className="text-sm text-[#8B7355]">o macaquinho que faz trade na solana</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide">PNL Total</div>
                  <div className="text-2xl font-black text-green-600">{totalPnl}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide">Humor</div>
                  <div className={`text-lg font-black px-3 py-1 rounded-full bg-gradient-to-r ${moods[monkeyMood].bg} text-white`}>
                    {monkeyMood}
                  </div>
                </div>
              </div>
            </div>
          </CuteFrame>
        </header>

        {/* Navigation */}
        <nav className="mb-5">
          <CuteFrame variant="light" className="p-2">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'terminal', label: 'Terminal' },
                { id: 'observando', label: 'Observando' },
                { id: 'galeria', label: 'Galeria' },
                { id: 'about', label: 'About' },
                { id: 'CA', label: 'CA' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white shadow-lg scale-105'
                      : 'bg-white/50 text-[#5D4E37] hover:bg-white/80 hover:scale-102'
                  }`}
                  style={{
                    boxShadow: activeTab === tab.id
                      ? '0 4px 15px rgba(255, 107, 53, 0.4)'
                      : '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CuteFrame>
        </nav>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column - Monkey */}
          <div className="lg:col-span-1">
            <CuteFrame variant="light" className="p-5 text-center" wobble>
              <BigMonkey />

              <CuteFrame variant="terminal" className="mt-4 p-3">
                <p className="text-[#FFD93D] text-sm font-bold">
                  &quot;{moods[monkeyMood].desc}&quot;
                </p>
              </CuteFrame>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'TRADES HOJE', value: '47', color: 'text-[#5D4E37]' },
                  { label: 'WIN RATE', value: '68%', color: 'text-green-600' },
                  { label: 'BALANCE', value: '2.45 SOL', color: 'text-[#5D4E37]' },
                  { label: 'BANANAS', value: '999', color: 'text-[#FF8C42]' },
                ].map((stat, i) => (
                  <CuteFrame key={i} variant="accent" className="p-3">
                    <div className="text-[10px] text-[#8B7355] font-bold uppercase">{stat.label}</div>
                    <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                  </CuteFrame>
                ))}
              </div>
            </CuteFrame>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Terminal Tab */}
            {activeTab === 'terminal' && (
              <CuteFrame variant="terminal" className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#FF8C42]/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFD93D]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#4ADE80]"></div>
                  </div>
                  <span className="text-[#FF8C42] text-sm font-bold ml-2">HISTORICO DE TRADES</span>
                </div>

                <div className="h-[400px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-xs">
                    <thead className="text-[#8B7355] sticky top-0 bg-[#2D2419]">
                      <tr>
                        <th className="text-left p-2 rounded-l-lg">HORA</th>
                        <th className="text-left p-2">TOKEN</th>
                        <th className="text-left p-2">TIPO</th>
                        <th className="text-right p-2">SOL</th>
                        <th className="text-right p-2">P/L</th>
                        <th className="text-center p-2 rounded-r-lg">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade, idx) => (
                        <tr key={trade.id} className={`border-b border-[#3D3429]/50 hover:bg-[#3D3429]/50 transition-colors ${idx % 2 === 0 ? 'bg-[#3D3429]/20' : ''}`}>
                          <td className="p-2 text-[#A89078]">{trade.time}</td>
                          <td className="p-2 text-[#FFD93D] font-bold">{trade.token}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              trade.type === 'BUY'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="p-2 text-right text-[#FFF5E6]">{trade.amount}</td>
                          <td className="p-2 text-right">
                            {trade.profit && (
                              <span className={`font-bold ${parseFloat(trade.profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {parseFloat(trade.profit) >= 0 ? '+' : ''}{trade.profit}%
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <span className={`text-[10px] font-bold ${trade.status === 'OK' ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.status === 'OK' ? '[OK]' : '[FAIL]'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-[#FF8C42]/30 text-[#8B7355] text-xs flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse"></span>
                  macaquinho esta trabalhando...
                </div>
              </CuteFrame>
            )}

            {/* Watching Tab */}
            {activeTab === 'observando' && (
              <CuteFrame variant="terminal" className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#FF8C42]/30">
                  <PaintIcons.eye />
                  <span className="text-[#FF8C42] text-sm font-bold">MOEDAS NA MIRA DO MACACO</span>
                </div>

                <div className="grid gap-3">
                  {watchingTokens.map((token, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-[#3D3429] to-[#2D2419] rounded-xl border border-[#3D3429] hover:border-[#FF8C42] transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg">
                          {token.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-[#FFF5E6] font-bold text-base">${token.name}</div>
                          <div className="text-[#8B7355] text-xs">MC: ${token.mc}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${token.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {token.change}%
                        </div>
                        <div className="text-xs flex items-center justify-end gap-1">
                          <span className="text-[#8B7355]">SCORE:</span>
                          <span className={`font-bold px-2 py-0.5 rounded-full ${
                            token.score >= 70
                              ? 'bg-green-500/20 text-green-400'
                              : token.score >= 50
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}>
                            {token.score}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#FF8C42]/30 text-[#8B7355] text-xs">
                  atualizado a cada 30s | score 65+ = macaco compra
                </div>
              </CuteFrame>
            )}

            {/* Gallery Tab */}
            {activeTab === 'galeria' && (
              <CuteFrame variant="light" className="p-5">
                <h2 className="text-xl font-black text-[#5D4E37] mb-5 flex items-center gap-2">
                  <PaintIcons.star /> GALERIA DO MACACO
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map(img => (
                    <div key={img.id} className="group cursor-pointer">
                      <CuteFrame variant="gallery" className="p-2 transition-transform hover:scale-105 hover:rotate-1">
                        <div className="aspect-square bg-gradient-to-br from-[#FFF5E6] to-[#FFE4C4] rounded-lg flex items-center justify-center overflow-hidden">
                          <svg viewBox="0 0 100 100" className="w-full h-full p-3 group-hover:scale-110 transition-transform">
                            <ellipse cx="50" cy="45" rx="28" ry="32" fill="#A89078" stroke="#5D4E37" strokeWidth="2"/>
                            <ellipse cx="50" cy="50" rx="20" ry="24" fill="#FFF5E6" stroke="#5D4E37" strokeWidth="1.5"/>
                            <circle cx="42" cy="45" r="4" fill="#5D4E37"/>
                            <circle cx="58" cy="45" r="4" fill="#5D4E37"/>
                            <circle cx="43" cy="43" r="1.5" fill="#FFF"/>
                            <circle cx="59" cy="43" r="1.5" fill="#FFF"/>
                            <circle cx="35" cy="55" r="6" fill="#FFB5B5" opacity="0.7"/>
                            <circle cx="65" cy="55" r="6" fill="#FFB5B5" opacity="0.7"/>
                            <path d="M44 60 Q50 66 56 60" stroke="#5D4E37" strokeWidth="1.5" fill="none"/>
                            <text x="50" y="92" textAnchor="middle" fontSize="10" fill="#8B7355" fontWeight="bold">#{img.id}</text>
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-bold text-[#FFF5E6]">{img.title}</div>
                          <div className="text-[10px] text-[#D4B896]">{img.desc}</div>
                        </div>
                      </CuteFrame>
                    </div>
                  ))}
                </div>
              </CuteFrame>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <CuteFrame variant="light" className="p-5">
                <h2 className="text-xl font-black text-[#5D4E37] mb-5 flex items-center gap-2">
                  <PaintIcons.monkey /> SOBRE O PROJETO
                </h2>

                <div className="space-y-4">
                  <CuteFrame variant="accent" className="p-4">
                    <h3 className="font-bold text-[#5D4E37] mb-2 text-lg">O QUE E ISSO?</h3>
                    <p className="text-sm text-[#5D4E37] leading-relaxed">
                      MONKEY TRADER e um bot autonomo que faz trades na Solana. Ele analisa tokens
                      novos no PumpFun usando IA e decide se compra ou nao. O macaquinho tem personalidade
                      propria e seu humor afeta as decisoes de trading!
                    </p>
                  </CuteFrame>

                  <CuteFrame variant="default" className="p-4">
                    <h3 className="font-bold text-white mb-3 text-lg">COMO FUNCIONA?</h3>
                    <div className="space-y-2 text-sm text-[#FFF5E6]">
                      {[
                        'Monitora tokens novos em tempo real',
                        'Analisa cada token com Claude AI',
                        'Decide baseado em score (65+ = compra)',
                        'Humor do macaco afeta o risco',
                        'Vende automatico em TP ou SL'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CuteFrame>

                  <CuteFrame variant="light" className="p-4">
                    <h3 className="font-bold text-[#5D4E37] mb-3 text-lg">SISTEMA DE HUMOR</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(moods).map(([mood, data]) => (
                        <div key={mood} className="flex items-center gap-3 p-2 bg-white/50 rounded-xl">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${data.bg}`}></div>
                          <div>
                            <span className="font-bold text-[#5D4E37] text-sm">{mood}</span>
                            <span className="text-[#8B7355] text-xs ml-2">{data.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CuteFrame>

                  <CuteFrame variant="terminal" className="p-4 text-center">
                    <p className="text-[#FFD93D] text-sm flex items-center justify-center gap-2">
                      feito com <PaintIcons.heart /> por um macaco que ama bananas
                    </p>
                  </CuteFrame>
                </div>
              </CuteFrame>
            )}

            {/* CA Tab */}
            {activeTab === 'CA' && (
              <CuteFrame variant="light" className="p-5">
                <h2 className="text-xl font-black text-[#5D4E37] mb-5 flex items-center gap-2">
                  <PaintIcons.coin /> CONTRACT ADDRESS
                </h2>

                <div className="space-y-4">
                  <CuteFrame variant="accent" className="p-4">
                    <label className="block text-sm font-bold text-[#5D4E37] mb-3">
                      COLE O CA DA MOEDA:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={caInput}
                        onChange={(e) => setCaInput(e.target.value)}
                        placeholder="Ex: 7GCihg..."
                        className="flex-1 p-3 bg-white/80 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF8C42] border-2 border-[#8B7355]/30"
                      />
                      <button
                        className="px-5 py-3 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
                      >
                        ANALISAR
                      </button>
                    </div>
                  </CuteFrame>

                  {caInput && (
                    <CuteFrame variant="terminal" className="p-4">
                      <div className="text-[#8B7355] text-xs mb-3 uppercase tracking-wide">Resultado da Analise:</div>
                      <div className="space-y-3">
                        {[
                          { label: 'Token', value: '$EXEMPLO', color: 'text-[#FFD93D]' },
                          { label: 'Market Cap', value: '$45,230', color: 'text-[#FFF5E6]' },
                          { label: 'Score do Macaco', value: '72/100', color: 'text-green-400' },
                          { label: 'Decisao', value: 'COMPRAR', color: 'text-green-400' },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-[#3D3429]/50 rounded-lg">
                            <span className="text-[#A89078] text-sm">{item.label}</span>
                            <span className={`font-bold ${item.color}`}>{item.value}</span>
                          </div>
                        ))}

                        <div className="mt-3 p-3 bg-[#3D3429] rounded-xl border border-[#FF8C42]/30">
                          <div className="text-[#8B7355] text-xs mb-2 uppercase">Pensamento do Macaco:</div>
                          <p className="text-[#FFD93D] text-sm italic">
                            &quot;hmm esse token tem cara de banana... vou comprar um pouco!&quot;
                          </p>
                        </div>
                      </div>
                    </CuteFrame>
                  )}

                  <CuteFrame variant="default" className="p-4">
                    <h3 className="font-bold text-white mb-3 text-sm">TOKEN OFICIAL</h3>
                    <div className="flex items-center gap-2 bg-white/20 p-3 rounded-xl">
                      <code className="flex-1 text-xs font-mono text-white/90 break-all">
                        Em breve...
                      </code>
                      <button
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        onClick={() => navigator.clipboard.writeText('Em breve...')}
                      >
                        <PaintIcons.copy />
                      </button>
                    </div>
                  </CuteFrame>
                </div>
              </CuteFrame>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-5">
          <CuteFrame variant="light" className="p-3 text-center">
            <p className="text-xs text-[#8B7355] flex items-center justify-center gap-2 flex-wrap">
              <span>MONKEY TRADER 2025</span>
              <span className="text-[#FF8C42]">|</span>
              <span>nao e conselho financeiro</span>
              <span className="text-[#FF8C42]">|</span>
              <span>macaco nao se responsabiliza por perdas</span>
              <PaintIcons.banana />
            </p>
          </CuteFrame>
        </footer>
      </div>
    </div>
  );
}
