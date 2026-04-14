import React, { useState, useEffect } from 'react';
import {
  Send,
  Search,
  CheckCheck,
  Loader2,
  MessageSquare,
  Phone,
  X
} from 'lucide-react';

// Default template: general_notification with 1 body variable {{1}}
const DEFAULT_TEMPLATE = {
  id: 'general_notificationn',
  name: 'General Notification',
  language: 'gu',
  variables: [
    { key: 'message', label: 'Message', placeholder: 'સંદેશ લખો...', multiline: true },
  ],
  preview: 'જે સેવા કરો છે... {{1}}'
};

const WhatsAppChatWindow = ({
  selectedUser,
  message,
  setMessage,
  handleSendMessage,
  isSending,
  isSelectionMode,
  selectedUsersCount,
  onTemplateSend,
  onBulkTemplateSend
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [templateVars, setTemplateVars] = useState({});

  // Reset message when user changes
  useEffect(() => {
    setTemplateVars({ message: '' });
  }, [selectedUser]);

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase()
        ? <span key={index} className="bg-yellow-300 font-bold">{part}</span>
        : part
    );
  };

  const handleVarChange = (key, value) => {
    setTemplateVars(prev => ({ ...prev, [key]: value }));
  };

  const getPreviewText = () => {
    let text = DEFAULT_TEMPLATE.preview;
    DEFAULT_TEMPLATE.variables.forEach((v, i) => {
      const val = templateVars[v.key] || v.placeholder;
      text = text.replace(`{{${i + 1}}}`, val);
    });
    return text;
  };

  const isReady = () => {
    return DEFAULT_TEMPLATE.variables.every(v => templateVars[v.key]?.toString().trim());
  };

  const handleTemplateSend = (e) => {
    e.preventDefault();
    if (!isReady()) return;

    if (onTemplateSend) {
      onTemplateSend({
        templateName: DEFAULT_TEMPLATE.id,
        language: DEFAULT_TEMPLATE.language,
        variables: templateVars,
        hasHeader: false,
      });
      setTemplateVars(prev => ({ ...prev, message: '' }));
    }
  };

  const handleBulkTemplateSend = (e) => {
    e.preventDefault();
    if (!isReady()) return;

    if (onBulkTemplateSend) {
      onBulkTemplateSend({
        templateName: DEFAULT_TEMPLATE.id,
        language: DEFAULT_TEMPLATE.language,
        variables: templateVars,
        hasHeader: false,
      });
      setTemplateVars(prev => ({ ...prev, message: '' }));
    }
  };

  // ---- Selection Mode (Bulk) ----
  if (isSelectionMode) {
    return (
      <div className="flex-1 flex flex-col bg-[#f0f2f5] relative overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {selectedUsersCount}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{selectedUsersCount} Users Selected</h3>
              <p className="text-[10px] text-primary font-medium">Bulk Announcement Mode</p>
            </div>
          </div>
        </div>

        <div
          className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center"
          style={{
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
            backgroundSize: 'contain',
            backgroundColor: '#e5ddd5'
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl max-w-md border border-white/50">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Bulk Message</h2>
            <p className="text-gray-600 text-sm mb-6">
              You have selected {selectedUsersCount} recipients. Type your message below to send it to all of them at once.
            </p>
            {selectedUsersCount === 0 && (
              <p className="text-orange-500 text-xs font-bold uppercase tracking-wider bg-orange-50 py-2 rounded-lg border border-orange-100">
                Please select at least one recipient
              </p>
            )}
          </div>
        </div>

        {/* Template Input & Send */}
        <div className="bg-white border-t border-gray-200/50">
          <div className="px-4 pt-3 pb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-[10px] font-bold text-green-700 uppercase tracking-wider">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {DEFAULT_TEMPLATE.name} · {selectedUsersCount} recipients
            </span>
          </div>

          <div className="px-4 py-2">
            {DEFAULT_TEMPLATE.variables.map((v) => (
              <div key={v.key}>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 block">
                  {v.label}
                </label>
                <textarea
                  rows="2"
                  value={templateVars[v.key] || ''}
                  onChange={(e) => handleVarChange(v.key, e.target.value)}
                  placeholder={v.placeholder}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleBulkTemplateSend(e);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          <div className="px-4 pb-3 pt-1">
            <button
              onClick={handleBulkTemplateSend}
              disabled={isSending || !isReady() || selectedUsersCount === 0}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to {selectedUsersCount} Users
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- No User Selected ----
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#f8f9fa]">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <MessageSquare className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Shree Sarveshwar Gaudham Announcement</h2>
        <p className="text-gray-500 text-sm max-w-md leading-relaxed">
          Select a donor from the list to start sending announcements via WhatsApp.
          Keep your community informed with ease.
        </p>
        <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
          <Phone className="w-3 h-3" /> End-to-end encrypted
        </div>
      </div>
    );
  }

  // ---- Chat Window with general_notification template ----
  return (
    <div className="flex-1 flex flex-col bg-[#f0f2f5] relative overflow-hidden">
      {/* Chat Header */}
      <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10 min-h-[65px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold">
            {selectedUser.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{selectedUser.name}</h3>
            <p className="text-[10px] text-green-500 font-medium">WhatsApp Account</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSearching ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search messages..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
                />
              </div>
              <button
                onClick={() => {
                  setIsSearching(false);
                  setChatSearchQuery('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <Search className="w-5 h-5 cursor-pointer hover:text-gray-800 transition" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        className="flex-1 p-6 overflow-y-auto flex flex-col gap-2 custom-scrollbar"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: 'contain',
          backgroundColor: '#e5ddd5'
        }}
      >
        <div className="self-center bg-primary-light/80 text-primary px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
          Announcement History
        </div>

        <div className={`self-start bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[70%] relative group transition-opacity duration-200 ${
          chatSearchQuery && !'Welcome to Shri Sarveshwar Gaudham announcement portal.'.toLowerCase().includes(chatSearchQuery.toLowerCase()) ? 'opacity-20' : 'opacity-100'
        }`}>
          <p className="text-sm text-gray-800">
            {highlightText('Welcome to Shri Sarveshwar Gaudham announcement portal.', chatSearchQuery)}
          </p>
        </div>

        <div className={`self-end bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[70%] relative group transition-opacity duration-200 ${
          chatSearchQuery && !`Ready to send your message to ${selectedUser.name}?`.toLowerCase().includes(chatSearchQuery.toLowerCase()) ? 'opacity-20' : 'opacity-100'
        }`}>
          <p className="text-sm text-gray-800">
            {highlightText(`Ready to send your message to ${selectedUser.name}?`, chatSearchQuery)}
          </p>
          <div className="absolute bottom-1 right-2 flex items-center gap-1">
            <CheckCheck className="w-3 h-3 text-primary" />
          </div>
        </div>

        {/* Template Preview */}
        {isReady() && (
          <div className="self-end bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] relative group mt-2">
            <p className="text-[10px] text-green-700 font-bold mb-1 uppercase tracking-wider">Preview</p>
            <p className="text-sm text-gray-800 whitespace-pre-line">{getPreviewText()}</p>
            <div className="absolute bottom-1 right-2 flex items-center gap-1">
              <CheckCheck className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Template Variable Input & Send */}
      <div className="bg-white border-t border-gray-200/50">
        {/* Template badge */}
        <div className="px-4 pt-3 pb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-[10px] font-bold text-green-700 uppercase tracking-wider">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {DEFAULT_TEMPLATE.name}
          </span>
        </div>

        {/* Message input */}
        <div className="px-4 py-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Message</span>
            <span className="text-gray-400 font-normal">Shift+Enter for new line</span>
          </label>
          <textarea
            rows="5"
            value={templateVars.message || ''}
            onChange={(e) => handleVarChange('message', e.target.value)}
            placeholder="સંદેશ લખો... (emojis, line breaks supported)"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition resize-y min-h-[80px] max-h-[200px]"
          />
        </div>

        {/* Send Button */}
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={handleTemplateSend}
            disabled={isSending || !isReady()}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send WhatsApp Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChatWindow;
