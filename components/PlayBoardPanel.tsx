import React from 'react';
import { X, Coins } from 'lucide-react';

export const PlayBoardMobileButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="relative bg-[#1a1a2e] border-l-2 border-t-2 border-b-2 border-blue-500 rounded-l-2xl p-2.5 flex items-center justify-center hover:bg-[#2a2a4e] transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
            <Coins size={20} className="text-gray-300" />
        </button>
    );
};

export const PlayBoardDesktopButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="bg-[#1a1a2e] border-l-2 border-t-2 border-b-2 border-blue-500 rounded-l-3xl p-3 flex flex-col items-center gap-1 hover:bg-[#2a2a4e] transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
            <Coins size={28} className="text-gray-300" />
            <span className="text-blue-500 font-bold text-[10px] uppercase text-center leading-tight mt-1">Play<br/>Board</span>
        </button>
    );
};

export const PlayBoardPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 z-[100] transition-opacity backdrop-blur-sm md:hidden"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`
                fixed z-[101] bg-[#1e293b] text-white flex flex-col shadow-2xl transition-transform duration-300
                /* Mobile: Bottom Sheet */
                bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                /* Desktop: Side Panel */
                md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[400px] md:h-full md:rounded-none md:transform ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} className="text-gray-400" />
                        </button>
                        <h2 className="text-xl font-semibold text-white">Play Board</h2>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center shadow-sm">
                        <Coins size={18} className="text-blue-400" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="text-center text-gray-500 mt-20">
                        <Coins size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium text-gray-400">Play Board is empty</p>
                        <p className="text-sm mt-2">Your active plays and challenges will appear here.</p>
                    </div>
                </div>
            </div>
        </>
    );
};
