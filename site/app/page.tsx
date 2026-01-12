'use client';

import React, { useState, useEffect } from 'react';
import { supabase, Trade, Token, SystemStatus, WalletBalance } from '../lib/supabase';

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

// Cute frame component
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
      style={{ boxShadow: '4px 4px 0 rgba(93, 78, 55, 0.5), inset 0 2px 0 rgba(255,255,255,0.2)' }}
    >
      {children}
    </div>
  );
};

// Gallery images
const galleryImages = [
  { id: 1, title: 'Tom 1', desc: 'thinking monkey', img: '/gallery/Screenshot_1_1.png' },
  { id: 2, title: 'Tom 2', desc: 'analyzing market', img: '/gallery/Screenshot_2_1.png' },
  { id: 3, title: 'Tom 3', desc: 'searching bananas', img: '/gallery/Screenshot_3_1.png' },
  { id: 4, title: 'Tom 4', desc: 'trading time', img: '/gallery/Screenshot_4_1.png' },
  { id: 5, title: 'Tom 5', desc: 'to the moon', img: '/gallery/Screenshot_5_1.png' },
  { id: 6, title: 'Tom 6', desc: 'banana time', img: '/gallery/Screenshot_6_1.png' },
  { id: 7, title: 'Tom Hero', desc: 'the trader monkey', img: '/gallery/aaa.png' },
  { id: 8, title: 'Tom Extra', desc: 'more bananas', img: '/gallery/xasd.png' },
];

const WALLET_ADDRESS = process.env.NEXT_PUBLIC_WALLET_ADDRESS || 'HGBcUnK1VaSfDvEozcggkkesDrraKujP9RCJFX4cxAF3';

export default function TomTrader() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [watchingTokens, setWatchingTokens] = useState<Token[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [caInput, setCaInput] = useState('');
  const [bounce, setBounce] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchTrades();
    fetchWatchingTokens();
    fetchSystemStatus();
    fetchBalance();

    // Bounce animation
    const bounceInterval = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }, 5000);

    return () => clearInterval(bounceInterval);
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    // Subscribe to trades
    const tradesChannel = supabase
      .channel('trades-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
        fetchTrades();
      })
      .subscribe();

    // Subscribe to tokens
    const tokensChannel = supabase
      .channel('tokens-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => {
        fetchWatchingTokens();
      })
      .subscribe();

    // Subscribe to system status
    const statusChannel = supabase
      .channel('status-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, () => {
        fetchSystemStatus();
      })
      .subscribe();

    // Subscribe to wallet balance
    const balanceChannel = supabase
      .channel('balance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_balance' }, () => {
        fetchBalance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(tokensChannel);
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(balanceChannel);
    };
  }, []);

  const fetchTrades = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*, tokens(nome, simbolo, logo)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setTrades(data);
  };

  const fetchWatchingTokens = async () => {
    const { data } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setWatchingTokens(data);
  };

  const fetchSystemStatus = async () => {
    const { data } = await supabase
      .from('system_status')
      .select('*')
      .single();
    if (data) setSystemStatus(data);
  };

  const fetchBalance = async () => {
    const { data } = await supabase
      .from('wallet_balance')
      .select('*')
      .eq('wallet_address', WALLET_ADDRESS)
      .single();
    if (data) setBalance(data.sol_balance || 0);
  };

  const getMood = () => {
    if (!systemStatus) return { name: 'OFFLINE', bg: 'from-gray-400 to-gray-500', desc: 'bot is offline' };
    const pnl = systemStatus.total_pnl || 0;
    const winRate = systemStatus.win_rate || 0;

    if (pnl > 1) return { name: 'EUPHORIC', bg: 'from-green-400 to-green-500', desc: 'found a golden banana!!' };
    if (pnl > 0.1 || winRate > 60) return { name: 'HAPPY', bg: 'from-green-300 to-green-400', desc: 'today is amazing' };
    if (systemStatus.status === 'ONLINE') return { name: 'NORMAL', bg: 'from-yellow-400 to-orange-400', desc: 'lets get to work' };
    if (pnl < -0.5) return { name: 'PANIC', bg: 'from-red-400 to-red-500', desc: 'AAAAAAAA' };
    return { name: 'NERVOUS', bg: 'from-orange-400 to-orange-500', desc: 'this market is crazy' };
  };

  const mood = getMood();
  const totalPnl = systemStatus?.total_pnl || 0;
  const winRate = systemStatus?.win_rate || 0;
  const totalTrades = systemStatus?.total_trades || 0;

  const BigMonkey = () => (
    <div className={`transition-transform duration-300 ${bounce ? 'scale-105' : 'scale-100'}`}>
      <img
        src="/logo.png"
        alt="Tom - Monkey Trader"
        className="w-full max-w-[180px] mx-auto rounded-2xl border-4 border-[#5D4E37] shadow-lg"
        style={{ boxShadow: '4px 4px 0 rgba(93, 78, 55, 0.5)' }}
      />
    </div>
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMC = (mc: number) => {
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(1)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 font-mono">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 animate-float-slow opacity-20"><PaintIcons.banana /></div>
        <div className="absolute top-32 right-20 animate-float-medium opacity-20"><PaintIcons.star /></div>
        <div className="absolute bottom-20 left-1/4 animate-float-slow opacity-20"><PaintIcons.leaf /></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-5">
          <CuteFrame variant="light" className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="animate-bounce-slow">
                  <img src="/logo.png" alt="Tom" className="w-12 h-12 rounded-full object-cover border-2 border-[#5D4E37]" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#5D4E37] tracking-tight flex items-center gap-2">
                    TOM TRADER
                    <span className="inline-block animate-wiggle"><PaintIcons.banana /></span>
                  </h1>
                  <p className="text-sm text-[#8B7355]">the little monkey that trades on Solana</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide">Balance</div>
                  <div className="text-2xl font-black text-[#5D4E37]">{balance.toFixed(4)} SOL</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide">Total PNL</div>
                  <div className={`text-2xl font-black ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(4)} SOL
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide">Mood</div>
                  <div className={`text-lg font-black px-3 py-1 rounded-full bg-gradient-to-r ${mood.bg} text-white`}>
                    {mood.name}
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
                { id: 'watching', label: 'Watching' },
                { id: 'gallery', label: 'Gallery' },
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
                  style={{ boxShadow: activeTab === tab.id ? '0 4px 15px rgba(255, 107, 53, 0.4)' : '0 2px 5px rgba(0,0,0,0.1)' }}
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
                <p className="text-[#FFD93D] text-sm font-bold">&quot;{mood.desc}&quot;</p>
              </CuteFrame>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'TRADES', value: totalTrades.toString(), color: 'text-[#5D4E37]' },
                  { label: 'WIN RATE', value: `${winRate.toFixed(0)}%`, color: winRate > 50 ? 'text-green-600' : 'text-red-600' },
                  { label: 'BALANCE', value: `${balance.toFixed(2)} SOL`, color: 'text-[#5D4E37]' },
                  { label: 'STATUS', value: systemStatus?.status || 'OFFLINE', color: systemStatus?.status === 'ONLINE' ? 'text-green-600' : 'text-[#FF8C42]' },
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
                  <span className="text-[#FF8C42] text-sm font-bold ml-2">TRADE HISTORY</span>
                  <span className="ml-auto text-[#8B7355] text-xs">{trades.length} trades</span>
                </div>

                <div className="h-[400px] overflow-y-auto custom-scrollbar">
                  {trades.length === 0 ? (
                    <div className="text-center text-[#8B7355] py-10">
                      <p>No trades yet...</p>
                      <p className="text-xs mt-2">Tom is watching the market</p>
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="text-[#8B7355] sticky top-0 bg-[#2D2419]">
                        <tr>
                          <th className="text-left p-2 rounded-l-lg">TIME</th>
                          <th className="text-left p-2">TOKEN</th>
                          <th className="text-left p-2">TYPE</th>
                          <th className="text-right p-2">SOL</th>
                          <th className="text-right p-2">P/L</th>
                          <th className="text-center p-2 rounded-r-lg">WHY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.map((trade, idx) => (
                          <tr key={trade.id} className={`border-b border-[#3D3429]/50 hover:bg-[#3D3429]/50 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-[#3D3429]/20' : ''}`}
                            onClick={() => setSelectedTrade(trade)}>
                            <td className="p-2 text-[#A89078]">{formatTime(trade.created_at)}</td>
                            <td className="p-2 text-[#FFD93D] font-bold">${trade.tokens?.simbolo || '???'}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                trade.tipo === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.tipo.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-2 text-right text-[#FFF5E6]">{trade.valor_sol.toFixed(3)}</td>
                            <td className="p-2 text-right">
                              {trade.pnl_sol !== undefined && trade.pnl_sol !== null && (
                                <span className={`font-bold ${trade.pnl_sol >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {trade.pnl_sol >= 0 ? '+' : ''}{trade.pnl_sol.toFixed(3)}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {trade.analysis_reason && (
                                <button className="text-[#FF8C42] hover:text-[#FFD93D]">
                                  <PaintIcons.eye />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Analysis Modal */}
                {selectedTrade && selectedTrade.analysis_reason && (
                  <div className="mt-4 p-4 bg-[#3D3429] rounded-xl border border-[#FF8C42]/30">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-[#FF8C42] font-bold">Tom&apos;s Analysis: ${selectedTrade.tokens?.simbolo}</h4>
                      <button onClick={() => setSelectedTrade(null)} className="text-[#8B7355] hover:text-white">X</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-[#2D2419] rounded-lg">
                        <div className="text-[10px] text-[#8B7355]">NARRATIVE</div>
                        <div className={`text-lg font-bold ${(selectedTrade.narrative_score || 0) >= 65 ? 'text-green-400' : 'text-[#FFD93D]'}`}>
                          {selectedTrade.narrative_score || 0}/100
                        </div>
                      </div>
                      <div className="text-center p-2 bg-[#2D2419] rounded-lg">
                        <div className="text-[10px] text-[#8B7355]">TICKER</div>
                        <div className={`text-lg font-bold ${(selectedTrade.ticker_score || 0) >= 65 ? 'text-green-400' : 'text-[#FFD93D]'}`}>
                          {selectedTrade.ticker_score || 0}/100
                        </div>
                      </div>
                      <div className="text-center p-2 bg-[#2D2419] rounded-lg">
                        <div className="text-[10px] text-[#8B7355]">IMAGE</div>
                        <div className={`text-lg font-bold ${(selectedTrade.image_score || 0) >= 65 ? 'text-green-400' : 'text-[#FFD93D]'}`}>
                          {selectedTrade.image_score || 0}/100
                        </div>
                      </div>
                    </div>
                    <p className="text-[#FFD93D] text-sm italic">&quot;{selectedTrade.analysis_reason}&quot;</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#FF8C42]/30 text-[#8B7355] text-xs flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${systemStatus?.status === 'ONLINE' ? 'bg-[#4ADE80]' : 'bg-[#FF6B6B]'}`}></span>
                  {systemStatus?.status === 'ONLINE' ? 'Tom is working...' : 'Tom is offline'}
                </div>
              </CuteFrame>
            )}

            {/* Watching Tab */}
            {activeTab === 'watching' && (
              <CuteFrame variant="terminal" className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#FF8C42]/30">
                  <PaintIcons.eye />
                  <span className="text-[#FF8C42] text-sm font-bold">TOKENS ANALYZED</span>
                  <span className="ml-auto text-[#8B7355] text-xs">{watchingTokens.length} tokens</span>
                </div>

                <div className="grid gap-3 max-h-[500px] overflow-y-auto">
                  {watchingTokens.length === 0 ? (
                    <div className="text-center text-[#8B7355] py-10">
                      <p>No tokens analyzed yet...</p>
                    </div>
                  ) : (
                    watchingTokens.map((token, i) => (
                      <div key={i} className="p-3 bg-gradient-to-r from-[#3D3429] to-[#2D2419] rounded-xl border border-[#3D3429] hover:border-[#FF8C42] transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg">
                              {token.simbolo?.slice(0, 2) || '??'}
                            </div>
                            <div>
                              <div className="text-[#FFF5E6] font-bold">${token.simbolo}</div>
                              <div className="text-[#8B7355] text-xs">{token.nome}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${(token.score || 0) >= 65 ? 'text-green-400' : 'text-[#FFD93D]'}`}>
                              {token.score || 0}/100
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              token.status === 'approved' || token.status === 'holding'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {token.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Score breakdown */}
                        <div className="grid grid-cols-3 gap-2 mt-2 mb-2">
                          <div className="text-center">
                            <div className="text-[9px] text-[#8B7355]">NARRATIVE</div>
                            <div className="text-sm font-bold text-[#FFD93D]">{token.narrative_score || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] text-[#8B7355]">TICKER</div>
                            <div className="text-sm font-bold text-[#FFD93D]">{token.ticker_score || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] text-[#8B7355]">IMAGE</div>
                            <div className="text-sm font-bold text-[#FFD93D]">{token.image_score || 0}</div>
                          </div>
                        </div>

                        {token.analysis_reason && (
                          <p className="text-[#A89078] text-xs italic mt-2 border-t border-[#3D3429] pt-2">
                            &quot;{token.analysis_reason}&quot;
                          </p>
                        )}

                        <div className="flex justify-between mt-2 text-[10px] text-[#8B7355]">
                          <span>MC: {formatMC(token.market_cap || 0)}</span>
                          <span>{formatTime(token.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#FF8C42]/30 text-[#8B7355] text-xs">
                  real-time updates | score 65+ = Tom buys
                </div>
              </CuteFrame>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <CuteFrame variant="light" className="p-5">
                <h2 className="text-xl font-black text-[#5D4E37] mb-5 flex items-center gap-2">
                  <PaintIcons.star /> TOM&apos;S GALLERY
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map(img => (
                    <div key={img.id} className="group cursor-pointer">
                      <CuteFrame variant="gallery" className="p-2 transition-transform hover:scale-105 hover:rotate-1">
                        <div className="aspect-square bg-gradient-to-br from-[#FFF5E6] to-[#FFE4C4] rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={img.img} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
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
                  <PaintIcons.monkey /> ABOUT THE PROJECT
                </h2>
                <div className="space-y-4">
                  <CuteFrame variant="accent" className="p-4">
                    <h3 className="font-bold text-[#5D4E37] mb-2 text-lg">WHAT IS THIS?</h3>
                    <p className="text-sm text-[#5D4E37] leading-relaxed">
                      TOM TRADER is an autonomous bot that trades on Solana. It analyzes new tokens
                      on PumpFun using AI and decides whether to buy or not. Tom has his own personality
                      and his mood affects trading decisions!
                    </p>
                  </CuteFrame>
                  <CuteFrame variant="default" className="p-4">
                    <h3 className="font-bold text-white mb-3 text-lg">HOW DOES IT WORK?</h3>
                    <div className="space-y-2 text-sm text-[#FFF5E6]">
                      {[
                        'Monitors new tokens in real time',
                        'Analyzes NARRATIVE strength (meme potential)',
                        'Evaluates TICKER appeal (catchy symbol)',
                        'Assesses IMAGE/branding quality',
                        'Auto buys if score >= 65, sells at TP/SL'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CuteFrame>
                  <CuteFrame variant="terminal" className="p-4 text-center">
                    <p className="text-[#FFD93D] text-sm flex items-center justify-center gap-2">
                      made with <PaintIcons.heart /> by a monkey who loves bananas
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
                  <CuteFrame variant="default" className="p-4">
                    <h3 className="font-bold text-white mb-3 text-sm">TOM&apos;S WALLET</h3>
                    <div className="flex items-center gap-2 bg-white/20 p-3 rounded-xl">
                      <code className="flex-1 text-xs font-mono text-white/90 break-all">{WALLET_ADDRESS}</code>
                      <button
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        onClick={() => navigator.clipboard.writeText(WALLET_ADDRESS)}
                      >
                        <PaintIcons.copy />
                      </button>
                    </div>
                    <p className="text-xs text-white/60 mt-2">Send SOL here to fund Tom&apos;s trades</p>
                  </CuteFrame>
                  <CuteFrame variant="default" className="p-4">
                    <h3 className="font-bold text-white mb-3 text-sm">OFFICIAL TOKEN</h3>
                    <div className="flex items-center gap-2 bg-white/20 p-3 rounded-xl">
                      <code className="flex-1 text-xs font-mono text-white/90 break-all">Coming soon...</code>
                      <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
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
              <span>TOM TRADER 2025</span>
              <span className="text-[#FF8C42]">|</span>
              <span>not financial advice</span>
              <span className="text-[#FF8C42]">|</span>
              <span>Tom is not responsible for losses</span>
              <PaintIcons.banana />
            </p>
          </CuteFrame>
        </footer>
      </div>
    </div>
  );
}
