import React, { useState } from 'react';
import WhatsAppUserList from './WhatsAppUserList';
import WhatsAppChatWindow from './WhatsAppChatWindow';
import { useLazyGetDonorsQuery, useSendAnnouncementMutation } from '../../../../services/donationApi';
import { useLazyGetSevaksQuery } from '../../../../services/sevakApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { toast } from 'react-toastify';

const AnnouncementPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userType, setUserType] = useState('donor');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkSend, setShowBulkSend] = useState(false);
  
  const [sendAnnouncement, { isLoading: isSending }] = useSendAnnouncementMutation();
  
  const [triggerGetDonors] = useLazyGetDonorsQuery();
  const donorPagination = useDropdownPagination(triggerGetDonors, {
    limit: 20,
    fields: 'id,name,mobileNumber,donationCount,lastMessage,lastMessageTime,city',
    skip: userType !== 'donor'
  });

  const [triggerGetSevaks] = useLazyGetSevaksQuery();
  const sevakPagination = useDropdownPagination(triggerGetSevaks, {
    limit: 20,
    fields: 'id,name,mobileNumber,city,lastMessage,lastMessageTime',
    skip: userType !== 'sevak'
  });

  const handleTemplateSend = async (templateData) => {
    if (!selectedUser) return;
    try {
      await sendAnnouncement({
        ...templateData,
        userId: selectedUser.id,
        mobileNumber: selectedUser.mobileNumber,
        userType: userType // 'donor' or 'sevak'
      }).unwrap();

      toast.success(`Message sent to ${selectedUser.name}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send message');
    }
  };

  const handleBulkTemplateSend = async (templateData) => {
    if (selectedUsers.length === 0) {
      toast.warn('Please select at least one recipient');
      return;
    }

    try {
      const currentPagination = userType === 'donor' ? donorPagination : sevakPagination;
      const usersToSend = currentPagination.items.filter(r => selectedUsers.includes(r.id));

      const sendPromises = usersToSend.map(user =>
        sendAnnouncement({
          ...templateData,
          userId: user.id,
          mobileNumber: user.mobileNumber,
          userType: userType // 'donor' or 'sevak'
        }).unwrap()
      );

      await Promise.all(sendPromises);
      toast.success(`Message sent to ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Bulk send error:', error);
      toast.error('Failed to send some messages');
    }
  };

  // Mobile: show chat when user tapped OR bulk send opened
  const showChatOnMobile = (selectedUser && !isSelectionMode) || showBulkSend;

  const handleBackToList = () => {
    setSelectedUser(null);
    setShowBulkSend(false);
    setIsSelectionMode(false);
    setSelectedUsers([]);
  };

  const handleOpenBulkSend = () => {
    setShowBulkSend(true);
  };

  return (
    <div className="fixed inset-0 lg:left-64 top-16 sm:top-20 bottom-0 bg-gray-50 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden z-20">
      <div className="flex-1 flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* User list: hidden on mobile when chat is open */}
        <div className={`${showChatOnMobile ? 'hidden md:flex' : 'flex'} w-full md:w-80 md:shrink-0 flex-col min-h-0 overflow-hidden`}>
          <WhatsAppUserList
            donorPagination={donorPagination}
            sevakPagination={sevakPagination}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            userType={userType}
            setUserType={setUserType}
            isSelectionMode={isSelectionMode}
            setIsSelectionMode={setIsSelectionMode}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            onOpenBulkSend={handleOpenBulkSend}
          />
        </div>
        {/* Chat window: hidden on mobile when no user selected */}
        <div className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
          <WhatsAppChatWindow
            key={isSelectionMode ? 'selection' : selectedUser?.id || 'none'}
            selectedUser={selectedUser}
            isSending={isSending}
            isSelectionMode={isSelectionMode}
            selectedUsersCount={selectedUsers.length}
            onTemplateSend={handleTemplateSend}
            onBulkTemplateSend={handleBulkTemplateSend}
            onBack={handleBackToList}
          />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementPage;
