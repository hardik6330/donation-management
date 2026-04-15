import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Loader2, Users, UserCheck, MoreVertical, CheckSquare, Square } from 'lucide-react';

const WhatsAppUserList = ({ 
  donorPagination,
  sevakPagination,
  selectedUser, 
  setSelectedUser,
  userType,
  setUserType,
  isSelectionMode,
  setIsSelectionMode,
  selectedUsers,
  setSelectedUsers
}) => {
  const currentPagination = userType === 'donor' ? donorPagination : sevakPagination;
  const { 
    items: currentList, 
    loading: isLoading, 
    search: searchQuery, 
    handleSearch: setSearchQuery, 
    handleLoadMore: onLoadMore, 
    hasMore 
  } = currentPagination;

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAll = () => {
    if (selectedUsers.length === currentList.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentList.map(u => u.id));
    }
    setShowMenu(false);
    setIsSelectionMode(true);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 shrink-0">
      {/* Header with Menu */}
      <div className="p-4 bg-white border-b border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          {isSelectionMode ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSelectAll}
                className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
              >
                {selectedUsers.length === currentList.length && currentList.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm font-bold text-gray-800">Select All</span>
              </button>
            </div>
          ) : (
            <h3 className="text-lg font-bold text-gray-800">Chats</h3>
          )}
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) setSelectedUsers([]);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {isSelectionMode ? 'Cancel Selection' : 'Select'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => {
              setUserType('donor');
              setSelectedUser(null);
              setSelectedUsers([]);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              userType === 'donor' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Donors
          </button>
          <button
            onClick={() => {
              setUserType('sevak');
              setSelectedUser(null);
              setSelectedUsers([]);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              userType === 'sevak' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Sevaks
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${userType}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {isLoading && currentList.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : currentList.length > 0 ? (
          <>
            {currentList.map((item) => (
              <div
                key={item.id}
                onClick={() => isSelectionMode ? toggleUserSelection(item.id) : setSelectedUser(item)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition hover:bg-white border-b border-gray-50/50 ${
                  selectedUser?.id === item.id && !isSelectionMode ? 'bg-white border-l-4 border-l-primary' : ''
                }`}
              >
                {isSelectionMode && (
                  <div className="shrink-0">
                    {selectedUsers.includes(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                )}
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary text-sm font-bold shrink-0">
                  {item.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{item.name}</h4>
                    {userType === 'donor' && (item.donationCount > 0 || item.donationCount === 0) && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.donationCount}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Donations</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-gray-400 font-medium leading-none mt-1.5">
                    {item.mobileNumber}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <p className="text-[11px] text-gray-500 truncate flex-1 leading-none">
                      {item.lastMessage ? (
                        <span className="text-primary font-semibold">
                          {item.lastMessage}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic text-[10px]">No messages sent</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.lastMessageTime && (
                        <span className="text-[9px] text-gray-400 font-medium">
                          {new Date(item.lastMessageTime).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                      {userType === 'sevak' && item.city && (
                        <span className="bg-green-50 text-green-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-green-100">
                          {item.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No {userType}s found
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppUserList;
