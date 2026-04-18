import React from 'react';
import { X, MoreHorizontal, MessageCircle } from 'lucide-react';

interface Comment {
    id: string;
    author: string;
    date: string;
    content: string;
    replies: number;
    avatarUrl: string;
    verified?: boolean;
}

const MOCK_COMMENTS: Comment[] = [
    {
        id: '1',
        author: 'Randseed',
        date: '2025/07/19',
        content: 'Chat about anything and everything, but... Do not impersonate others in a deceptive or misleading manner. Do not intentionally share false or misleading information.',
        replies: 1,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Randseed'
    },
    {
        id: '2',
        author: 'Dcandra989',
        date: '2025/12/01',
        content: 'P',
        replies: 1,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dcandra989',
        verified: true
    },
    {
        id: '3',
        author: 'Dcandra989',
        date: '2025/12/01',
        content: 'P',
        replies: 0,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dcandra989',
        verified: true
    },
    {
        id: '4',
        author: 'Pragya',
        date: '2025/11/12',
        content: 'Y',
        replies: 1,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pragya',
        verified: true
    },
    {
        id: '5',
        author: 'John',
        date: '2025/10/29',
        content: 'To the management of Randseed, please add to the daily bonus,is too small 🙏',
        replies: 1,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        verified: true
    }
];

export const CommentsMobileButton: React.FC<{ onClick: () => void; unreadCount?: number }> = ({ onClick, unreadCount = 0 }) => {
    const displayUnread = unreadCount > 99 ? '99+' : unreadCount;
    return (
        <button 
            onClick={onClick}
            className="relative bg-[#1a1a2e] border-l-2 border-t-2 border-b-2 border-fuchsia-500 rounded-l-2xl p-2.5 flex items-center justify-center hover:bg-[#2a2a4e] transition-colors shadow-[0_0_15px_rgba(217,70,239,0.3)]"
        >
            <MessageCircle size={20} className="text-gray-300" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0f172a] leading-none shadow-sm">
                    {displayUnread}
                </span>
            )}
        </button>
    );
};

export const CommentsDesktopButton: React.FC<{ onClick: () => void; isOpen: boolean; unreadCount?: number }> = ({ onClick, isOpen, unreadCount = 0 }) => {
    const displayUnread = unreadCount > 99 ? '99+' : unreadCount;
    return (
        <button 
            onClick={onClick}
            className={`bg-[#1a1a2e] border-l-2 border-t-2 border-b-2 border-fuchsia-500 rounded-l-3xl p-3 flex flex-col items-center gap-2 hover:bg-[#2a2a4e] transition-colors shadow-[0_0_15px_rgba(217,70,239,0.3)]`}
        >
            <MessageCircle size={28} className="text-gray-300" />
            <span className="text-orange-500 font-bold text-lg">{displayUnread}</span>
        </button>
    );
};

// Export the main panel as before
export const CommentsPanel: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    isFloatingEnabled?: boolean;
    onToggleFloating?: (enabled: boolean) => void;
}> = ({ isOpen, onClose, isFloatingEnabled = true, onToggleFloating }) => {
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
                fixed z-[101] bg-[#e5e7eb] text-gray-800 flex flex-col shadow-2xl transition-transform duration-300
                /* Mobile: Bottom Sheet */
                bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                /* Desktop: Side Panel */
                md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[400px] md:h-full md:rounded-none md:transform ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-300 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-1 hover:bg-gray-300 rounded-full transition-colors">
                            <X size={24} className="text-gray-800" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Floating Comments Toggle */}
                        {onToggleFloating && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">Float</span>
                                <button 
                                    onClick={() => onToggleFloating(!isFloatingEnabled)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isFloatingEnabled ? 'bg-fuchsia-500' : 'bg-gray-400'}`}
                                >
                                    <span 
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isFloatingEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        )}

                        <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center relative shadow-sm">
                            <span className="text-[10px] font-black text-black tracking-tighter">Quick</span>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-200 shadow-sm">
                                <MessageCircle size={12} className="text-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {MOCK_COMMENTS.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="relative shrink-0">
                                <img src={comment.avatarUrl} alt={comment.author} className="w-10 h-10 rounded-full bg-gray-300" />
                                {comment.verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-[#e5e7eb]">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mb-1.5">{comment.date}</div>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    {comment.content}
                                </p>
                                {comment.replies > 0 && (
                                    <button className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors">
                                        {comment.replies} Reply ›
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#e5e7eb] border-t border-gray-300 shrink-0 pb-8 md:pb-4">
                    <div className="flex items-center gap-3 bg-gray-200/60 rounded-full p-2 border border-gray-300/50">
                        <div className="relative shrink-0">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser" alt="You" className="w-8 h-8 rounded-full bg-white border-2 border-red-400" />
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-[#e5e7eb]">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Add a comment for Quick Quid" 
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
