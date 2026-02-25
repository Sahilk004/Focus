import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const SidebarItem = ({ id, label, icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-primary-50 text-primary-600 shadow-sm'
            : 'text-dark-500 hover:bg-white/50 hover:text-dark-700'
            }`}
    >
        <span className={`p-2 rounded-lg transition-colors ${active ? 'bg-white text-primary-600' : 'bg-transparent text-dark-400 group-hover:text-dark-600'
            }`}>
            <Icon name={icon} size={20} />
        </span>
        <span className="font-medium">{label}</span>
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />
        )}
    </button>
);

const Layout = ({ children, activeTab, setActiveTab, onLogout, user }) => {
    const menuItems = [
        { id: 'notes', label: 'Process Notes', icon: 'file' },
        { id: 'liveRecording', label: 'Live Recording', icon: 'record-dot' },
        { id: 'meeting', label: 'Upload Media', icon: 'video' },
        { id: 'chat', label: 'Ask Questions', icon: 'message-circle' },
        { id: 'schedule', label: 'Study Schedule', icon: 'calendar' },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-dark-50">
            {/* Sidebar */}
            <aside className="w-72 glass-panel m-4 mr-0 flex flex-col relative z-20">
                <div className="p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3 text-primary-600">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Icon name="message-circle" size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-dark-900">FocusFlow</h1>
                            <p className="text-xs text-dark-400 font-medium">ADHD Assistant</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            {...item}
                            active={activeTab === item.id}
                            onClick={setActiveTab}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/20">
                    <div className="bg-primary-50/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-dark-800 truncate">{user?.name || user?.email || 'User'}</p>
                                <p className="text-xs text-dark-500 truncate">{user?.email || 'Free Plan'}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-lg border border-dark-200 text-dark-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 text-sm font-medium"
                    >
                        <Icon name="x" size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 relative">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
