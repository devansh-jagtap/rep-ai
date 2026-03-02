'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronRight,
    MessageSquare,
    Zap,
    Target,
    BookOpen,
    Layers,
    UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Shared Styles ---
const CARD_BG = "bg-[#faf9f6]";
const BORDER_COLOR = "border-[#e8e4db]";
const ACCENT_COLOR = "#D36746";

// --- Card 01: Agent Intelligence ---
const IntelligenceScheduleCard = () => {
    const [activeDay, setActiveDay] = useState(2); // Wednesday
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const sources = [
        { time: '09:00', type: 'Bio', label: 'Processing personal bio...' },
        { time: '10:30', type: 'Web', label: 'Scanning portfolio sites' },
        { time: '14:00', type: 'Social', label: 'Mapping voice patterns' },
        { time: '16:45', type: 'Sync', label: 'Calibrating knowledge' },
    ];

    return (
        <div className={cn("flex flex-col h-full rounded-[2.5rem] p-8 border transition-all duration-500 hover:shadow-xl hover:shadow-neutral-200/50", CARD_BG, BORDER_COLOR)}>
            <div className="text-center mb-6">
                <span className="text-xs font-bold text-[#D36746] tracking-[0.2em] mb-3 block uppercase leading-none">01</span>
                <h3 className="font-serif text-2xl text-neutral-900 mb-2 tracking-tight">Intelligence Sync</h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-[200px] mx-auto">
                    Automated learning from your footprint.
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                {/* Horizontal Timeline */}
                <div className="flex justify-between items-center gap-1.5">
                    {days.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(idx)}
                            className={cn(
                                "flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all duration-300 border",
                                activeDay === idx
                                    ? "bg-[#D36746] border-[#D36746] text-white shadow-lg shadow-[#D36746]/20"
                                    : "bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200"
                            )}
                        >
                            <span className="text-[9px] font-bold tracking-tighter mb-0.5">{day}</span>
                            <span className="text-base font-serif">{idx + 5}</span>
                        </button>
                    ))}
                </div>

                {/* Status Timeline */}
                <div className="space-y-3">
                    {sources.map((s, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 group-timeline"
                        >
                            <span className="text-[9px] font-bold text-neutral-300 w-8">{s.time}</span>
                            <div className={cn(
                                "flex-1 p-2.5 rounded-xl border border-neutral-100 flex items-center justify-between transition-all duration-300",
                                idx === 1 ? "bg-[#D36746]/5 border-[#D36746]/20" : "bg-white"
                            )}>
                                <span className="text-[11px] text-neutral-600 font-medium">{s.label}</span>
                                {idx === 1 && <div className="size-1.5 rounded-full bg-[#D36746] animate-pulse" />}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Card 02: Performance Metric Ranges ---
const MetricRangesCard = () => {
    return (
        <div className={cn("flex flex-col h-full rounded-[2.5rem] p-8 border transition-all duration-500 hover:shadow-xl hover:shadow-neutral-200/50", CARD_BG, BORDER_COLOR)}>
            <div className="text-center mb-6">
                <span className="text-xs font-bold text-[#D36746] tracking-[0.2em] mb-3 block uppercase leading-none">02</span>
                <h3 className="font-serif text-2xl text-neutral-900 mb-2 tracking-tight">Growth Metrics</h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-[200px] mx-auto">
                    Real-time performance goals.
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="relative h-32 w-full border-l border-b border-neutral-200/60 pb-3 ml-6">
                    {/* Range Labels */}
                    <div className="absolute -left-14 top-0 bottom-0 flex flex-col justify-between py-1 text-[9px] font-bold text-neutral-300 tracking-widest uppercase items-end pr-3">
                        <span>Peak</span>
                        <span>Target</span>
                        <span>Floor</span>
                    </div>

                    {/* Chart Area */}
                    <div className="absolute inset-0 pt-2 pr-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                            {/* Target Zone Background */}
                            <rect x="0" y="36" width="400" height="48" fill="#D36746" fillOpacity="0.03" />

                            {/* Grid Lines */}
                            <line x1="0" y1="36" x2="400" y2="36" stroke="#D36746" strokeOpacity="0.1" strokeDasharray="4 4" />
                            <line x1="0" y1="84" x2="400" y2="84" stroke="#D36746" strokeOpacity="0.1" strokeDasharray="4 4" />

                            {/* Data Line */}
                            <motion.path
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                d="M0,100 L100,60 L200,80 L300,20 L400,40"
                                fill="none"
                                stroke="#D36746"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-white/50 border border-neutral-100 p-3 rounded-xl text-center">
                        <div className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase mb-0.5">Conversion</div>
                        <div className="text-xl font-serif text-neutral-900">+24%</div>
                    </div>
                    <div className="bg-white/50 border border-neutral-100 p-3 rounded-xl text-center">
                        <div className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase mb-0.5">Engagement</div>
                        <div className="text-xl font-serif text-neutral-900">High</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Card 03: Personality Modules ---
const PersonalityModulesCard = () => {
    const [selectedModule, setSelectedModule] = useState(0);
    const modules = [
        {
            label: "Professional",
            icon: <BookOpen className="size-4" />,
            desc: "Expert, analytical tone",
            txt: "“I’ve analyzed your requirements and architectural constraints. My findings suggest a decoupled approach would yield 40% better scalability.”"
        },
        {
            label: "Collaborative",
            icon: <UserCircle className="size-4" />,
            desc: "Warm, partnership focus",
            txt: "“I love where you're going with this! I'd be thrilled to partner with you and bring this vision to life. Let's build something great together.”"
        },
        {
            label: "Strategic",
            icon: <Target className="size-4" />,
            desc: "Direct, outcome-oriented",
            txt: "“The primary objective is clear. I’ll focus on the high-impact deliverables first to ensure we hit your revenue goals by Q3.”"
        }
    ];

    return (
        <div className={cn("flex flex-col h-full rounded-[2.5rem] p-8 border transition-all duration-500 hover:shadow-xl hover:shadow-neutral-200/50", CARD_BG, BORDER_COLOR)}>
            <div className="text-center mb-6">
                <span className="text-xs font-bold text-[#D36746] tracking-[0.2em] mb-3 block uppercase leading-none">03</span>
                <h3 className="font-serif text-2xl text-neutral-900 mb-2 tracking-tight">Voice Identity</h3>
                <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-[200px] mx-auto">
                    Define how your agent represents you.
                </p>
            </div>

            <div className="flex-1 space-y-3">
                {modules.map((m, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedModule(idx)}
                        className={cn(
                            "w-full flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 text-left",
                            selectedModule === idx
                                ? "bg-white border-[#D36746]/20 shadow-md shadow-[#D36746]/5"
                                : "bg-transparent border-neutral-100/50 hover:bg-white/40"
                        )}
                    >
                        <div className={cn(
                            "size-9 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-sm",
                            selectedModule === idx ? "bg-[#D36746] text-white" : "bg-neutral-100 text-neutral-400"
                        )}>
                            {m.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5", selectedModule === idx ? "text-neutral-900" : "text-neutral-500")}>
                                {m.label}
                            </h4>
                            <p className="text-[10px] text-neutral-400 leading-none">{m.desc}</p>
                        </div>
                        {selectedModule === idx && <div className="size-1.5 rounded-full bg-[#D36746]" />}
                    </button>
                ))}

                <div className="mt-4 relative p-4 bg-white border border-neutral-100 rounded-xl min-h-[90px] flex items-center">
                    <div className="absolute -top-2.5 left-4 px-2 bg-[#faf9f6]/95 backdrop-blur-sm border border-neutral-100 rounded-full text-[8px] font-bold text-[#D36746] uppercase tracking-[0.2em]">
                        Live Preview
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={selectedModule}
                            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                            className="text-[13px] italic text-neutral-700 leading-relaxed font-serif"
                        >
                            {modules[selectedModule].txt}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function FeaturesInteractive() {
    return (
        <section className="bg-white py-24 overflow-hidden border-t border-neutral-100">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-900 tracking-tight leading-[1.1]"
                    >
                        Managing is <span className="italic">easy</span>.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-base text-neutral-400 font-light max-w-lg leading-relaxed"
                    >
                        Your AI agent works around the clock, perfectly mirroring your style.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <IntelligenceScheduleCard />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                    >
                        <MetricRangesCard />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    >
                        <PersonalityModulesCard />
                    </motion.div>
                </div>

                <div className="mt-24 flex flex-col md:flex-row items-center justify-center gap-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-14 px-10 rounded-full bg-[#D36746] text-white font-bold text-sm transition-all hover:bg-[#b05234] shadow-lg shadow-[#D36746]/20"
                    >
                        Build your agent
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-14 px-10 rounded-full border border-[#D36746] text-[#D36746] font-bold text-sm transition-all hover:bg-[#D36746]/5"
                    >
                        How it works
                    </motion.button>
                </div>
            </div>
        </section>
    );
}
