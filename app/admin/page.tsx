'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    conversations: 0,
    todayConversations: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const convRes = await fetch('/api/conversations');
      const conversations = await convRes.json();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayConversations = conversations.filter((c: any) => {
        const convDate = new Date(c.createdAt);
        return convDate >= today;
      });

      setStats({
        activeUsers: 150, // Mock data
        conversations: conversations.length,
        todayConversations: todayConversations.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2 gradient-text animate-slide-up" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Dashboard
      </h1>
      <p className="text-gray-600 mb-8 text-sm">Welcome back! Here's your overview.</p>

      {/* Stats Cards - Glassmorphic with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 hover-lift animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)', animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Active Users</p>
              <p className="text-4xl font-bold gradient-text" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stats.activeUsers}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="material-symbols-outlined text-white text-2xl relative z-10">people</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)', animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Total Conversations</p>
              <p className="text-4xl font-bold gradient-text" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stats.conversations}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 8px 30px rgba(79, 172, 254, 0.3)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="material-symbols-outlined text-white text-2xl relative z-10">chat</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)', animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Today's Conversations</p>
              <p className="text-4xl font-bold gradient-text" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stats.todayConversations}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', boxShadow: '0 8px 30px rgba(240, 147, 251, 0.3)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="material-symbols-outlined text-white text-2xl relative z-10">today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            Chatbot Usage
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400 rounded-xl neu-card-inset" style={{ background: 'rgba(240, 240, 243, 0.5)' }}>
            <p className="text-sm">Chart placeholder - Connect charting library</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">trending_up</span>
            User Engagement
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400 rounded-xl neu-card-inset" style={{ background: 'rgba(240, 240, 243, 0.5)' }}>
            <p className="text-sm">Chart placeholder - Connect charting library</p>
          </div>
        </div>
      </div>

      {/* Recent Login Activity */}
      <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Recent Login Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl glass-card hover-lift transition-all" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
            <div>
              <p className="font-semibold text-charcoal">Admin User</p>
              <p className="text-sm text-gray-600">Logged in 2 hours ago</p>
            </div>
            <span className="px-4 py-2 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
              SUCCESS
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl glass-card hover-lift transition-all" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
            <div>
              <p className="font-semibold text-charcoal">Editor User</p>
              <p className="text-sm text-gray-600">Logged in 5 hours ago</p>
            </div>
            <span className="px-4 py-2 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
              SUCCESS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
