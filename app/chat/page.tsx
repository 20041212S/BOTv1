'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages?: Message[];
}

interface Source {
  title: string;
  snippet: string;
  documentId?: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [showPolicyBanner, setShowPolicyBanner] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user has registered before allowing access to chat
    const isLoggedIn = localStorage.getItem('clientUserLoggedIn');
    const clientUserId = localStorage.getItem('clientUserId');
    
    // Redirect to login if not logged in or missing required data
    if (isLoggedIn !== 'true' || !clientUserId) {
      localStorage.removeItem('clientUserLoggedIn');
      localStorage.removeItem('clientUserId');
      localStorage.removeItem('clientUserType');
      router.push('/');
      return;
    }
    setIsAuthorized(true);
    loadConversations();
  }, [router]);

  useEffect(() => {
    if (activeConversation) {
      loadConversationMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setSources([]);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: activeConversation?.id,
        }),
      });

      const data = await res.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: data.answer,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Set sources if available
      if (data.sources) {
        setSources(data.sources);
      }

      // Update active conversation
      if (data.conversationId) {
        const updatedConv: Conversation = {
          id: data.conversationId,
          title: activeConversation?.title || userMessage.substring(0, 50),
          updatedAt: new Date().toISOString(),
        };
        setActiveConversation(updatedConv);
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const quickLinks = [
    { icon: 'school', label: 'Academics' },
    { icon: 'calendar_month', label: 'Timetable' },
    { icon: 'receipt_long', label: 'Fees' },
    { icon: 'local_library', label: 'Library' },
    { icon: 'map', label: 'Campus Map' },
    { icon: 'contacts', label: 'Contacts' },
  ];

  // Show loading while checking authorization
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-700 font-medium">Checking registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Left Sidebar - Conversations - Glassmorphic */}
      <aside className="hidden lg:flex w-[320px] flex-col glass-card border-r" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255, 255, 255, 0.18)' }}>
        <div className="shrink-0 p-4">
          <div className="flex items-center gap-3 px-2 pt-2 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl relative overflow-hidden animate-float" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <p className="text-xl font-bold text-white relative z-10">PCE</p>
            </div>
            <p className="text-charcoal text-lg font-bold gradient-text" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PCE Assistant</p>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/60 z-10">
              search
            </span>
            <input
              className="modern-input w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-charcoal placeholder-charcoal/60"
              placeholder="Search conversations..."
              type="text"
            />
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <div>
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-charcoal/50 mb-2">
              Conversations
            </h3>
            <ul className="flex flex-col gap-1">
              {conversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 transition-all hover-lift ${
                    activeConversation?.id === conv.id
                      ? 'neu-card-inset'
                      : 'hover:bg-white/20'
                  }`}
                  style={activeConversation?.id === conv.id ? { background: 'rgba(102, 126, 234, 0.15)', boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.8)' } : {}}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      activeConversation?.id === conv.id ? 'text-primary' : 'text-charcoal/80'
                    }`}
                  >
                    chat_bubble
                  </span>
                  <p
                    className={`text-sm leading-tight truncate ${
                      activeConversation?.id === conv.id
                        ? 'text-primary font-semibold'
                        : 'text-charcoal font-medium'
                    }`}
                  >
                    {conv.title}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-charcoal/50 mb-2">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-1">
              {quickLinks.map((link) => (
                <li
                  key={link.label}
                  className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 transition-all hover-lift hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-charcoal/80 text-[22px]">
                    {link.icon}
                  </span>
                  <p className="text-charcoal text-sm font-medium leading-tight truncate">
                    {link.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        <header className="flex shrink-0 items-center justify-between glass-card p-4" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <button className="flex size-10 items-center justify-center text-charcoal lg:hidden">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1 className="text-charcoal text-lg font-bold leading-tight gradient-text" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {activeConversation?.title || 'Campus Assistant'}
          </h1>
          <div className="w-10"></div>
        </header>

        <main
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 scroll-smooth custom-scrollbar"
        >
          {showPolicyBanner && (
            <div className="flex items-center justify-between rounded-2xl glass-card p-4 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="flex flex-col gap-1">
                <p className="text-charcoal text-sm font-semibold leading-tight">
                  Policy Information
                </p>
                <p className="text-gray-500 text-sm font-normal leading-normal">
                  Your conversations help improve our service. Please don't share personal information.
                </p>
              </div>
              <button
                onClick={() => setShowPolicyBanner(false)}
                className="text-sm font-medium leading-normal text-gray-500 hover:text-charcoal"
              >
                Dismiss
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex items-end gap-3 animate-fade-in">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden animate-float" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="material-symbols-outlined text-white relative z-10 m-auto block text-2xl">support_agent</span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 items-start">
                <p className="text-charcoal/70 text-[13px] font-medium leading-normal max-w-[360px]">
                  Campus Assistant
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <p className="chat-bubble-assistant text-base font-normal leading-normal flex max-w-[360px] rounded-2xl rounded-bl-none px-5 py-4 text-charcoal">
                    Hello! I'm the PCE Campus Assistant. How can I help you today? You can ask me about library hours, fee deadlines, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleSuggestionClick('What are the library hours?')}
                      className="rounded-xl glass-card px-4 py-2 text-sm text-charcoal hover-lift transition-all"
                      style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                    >
                      What are the library hours?
                    </button>
                    <button
                      onClick={() => handleSuggestionClick('When is the fee deadline?')}
                      className="rounded-xl glass-card px-4 py-2 text-sm text-charcoal hover-lift transition-all"
                      style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                    >
                      When is the fee deadline?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
            >
              {message.sender === 'assistant' && (
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="material-symbols-outlined text-white relative z-10 m-auto block text-xl">support_agent</span>
                </div>
              )}
              <div
                className={`flex flex-1 flex-col gap-1.5 items-${message.sender === 'user' ? 'end' : 'start'}`}
              >
                <p
                  className={`text-charcoal/70 text-[13px] font-medium leading-normal max-w-[360px] ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}
                >
                  {message.sender === 'user' ? 'You' : 'Campus Assistant'}
                </p>
                <p
                  className={`text-base font-normal leading-normal flex max-w-[360px] rounded-2xl px-5 py-4 shadow-soft animate-slide-up ${
                    message.sender === 'user'
                      ? 'chat-bubble-user text-white rounded-br-none'
                      : 'chat-bubble-assistant text-charcoal rounded-bl-none'
                  }`}
                  style={message.sender === 'user' ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)' } : {}}
                >
                  {message.content}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 8px 30px rgba(79, 172, 254, 0.3)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="material-symbols-outlined text-white relative z-10 m-auto block text-xl">person</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-3">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="material-symbols-outlined text-white relative z-10 m-auto block text-xl">support_agent</span>
              </div>
              <div className="flex items-center justify-center rounded-2xl rounded-bl-none px-5 py-4 glass-card" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)' }}>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></span>
                  <span className="size-2 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.2s]" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></span>
                  <span className="size-2 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.4s]" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></span>
                </div>
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="flex flex-col gap-3 ml-12">
              <h3 className="text-charcoal/80 text-sm font-bold leading-tight tracking-[-0.015em] px-1 pt-2">
                Sources
              </h3>
              <div className="flex flex-col items-stretch justify-start rounded-2xl glass-card overflow-hidden animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                {sources.map((source, index) => (
                  <div
                    key={index}
                    className={`flex w-full min-w-72 grow flex-col items-stretch justify-center gap-2 p-4 ${
                      index < sources.length - 1 ? 'border-b border-soft-gray/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-7 rounded-full font-semibold text-xs text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        <span className="relative z-10">{index + 1}</span>
                      </div>
                      <p className="text-primary text-sm font-semibold leading-normal flex-1">
                        {source.title}
                      </p>
                    </div>
                    <p className="text-charcoal text-sm font-normal leading-normal pl-9">
                      {source.snippet}
                    </p>
                    <div className="flex items-end gap-3 justify-end pt-1">
                      <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden h-9 px-4 text-charcoal text-sm font-medium leading-normal rounded-xl hover-lift transition-all" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
                        <span className="truncate">View document</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        <footer className="absolute bottom-0 left-0 right-0 glass-card" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <div className="flex items-center gap-3 p-4">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="modern-input w-full rounded-2xl py-4 px-5 text-charcoal placeholder-charcoal/60"
              placeholder="Ask about exams, timetables, admissions..."
              type="text"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="btn-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white relative overflow-hidden group disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <span className="material-symbols-outlined relative z-10">send</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
          <nav className="flex h-16 w-full items-center justify-around glass-card" style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)', borderTop: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <a className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: '#667eea' }} href="#">
              <span className="material-symbols-outlined text-2xl">chat</span>
              <span className="text-xs font-semibold">Chat</span>
            </a>
            <a className="flex flex-col items-center gap-1 text-charcoal/60 hover:scale-110 transition-all" style={{ color: 'inherit' }} href="#">
              <span className="material-symbols-outlined text-2xl">school</span>
              <span className="text-xs font-medium">Academics</span>
            </a>
            <a className="flex flex-col items-center gap-1 text-charcoal/60 hover:scale-110 transition-all" style={{ color: 'inherit' }} href="#">
              <span className="material-symbols-outlined text-2xl">local_library</span>
              <span className="text-xs font-medium">Library</span>
            </a>
            <a className="flex flex-col items-center gap-1 text-charcoal/60 hover:scale-110 transition-all" style={{ color: 'inherit' }} href="#">
              <span className="material-symbols-outlined text-2xl">settings</span>
              <span className="text-xs font-medium">Settings</span>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}

