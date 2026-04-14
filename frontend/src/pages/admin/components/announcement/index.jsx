import React, { useState } from 'react';
import WhatsAppUserList from './WhatsAppUserList';
import WhatsAppChatWindow from './WhatsAppChatWindow';
import { useLazyGetDonorsQuery, useSendAnnouncementMutation } from '../../../../services/donationApi';
import { useLazyGetSevaksQuery } from '../../../../services/sevakApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { toast } from 'react-toastify';

const AnnouncementPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState('donor');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const [sendAnnouncement, { isLoading: isSending }] = useSendAnnouncementMutation();
  
  const [triggerGetDonors] = useLazyGetDonorsQuery();
  const donorPagination = useDropdownPagination(triggerGetDonors, {
    limit: 20,
    fields: 'id,name,mobileNumber,donationCount',
    rowsKey: 'donors',
    skip: userType !== 'donor'
  });

  const [triggerGetSevaks] = useLazyGetSevaksQuery();
  const sevakPagination = useDropdownPagination(triggerGetSevaks, {
    limit: 20,
    fields: 'id,name,mobileNumber,city',
    rowsKey: 'rows',
    skip: userType !== 'sevak'
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (isSelectionMode) {
      if (selectedUsers.length === 0) {
        toast.warn('Please select at least one recipient');
        return;
      }

      try {
        const currentPagination = userType === 'donor' ? donorPagination : sevakPagination;
        const usersToSend = currentPagination.items.filter(r => selectedUsers.includes(r.id));

        const sendPromises = usersToSend.map(user => 
          sendAnnouncement({
            userId: user.id,
            mobileNumber: user.mobileNumber,
            message: message.trim(),
            templateName: 'general_notification'
          }).unwrap()
        );

        await Promise.all(sendPromises);
        toast.success(`Message sent to ${selectedUsers.length} users`);
        setMessage('');
        setSelectedUsers([]);
        setIsSelectionMode(false);
      } catch (error) {
        console.error('Bulk send error:', error);
        toast.error('Failed to send some messages');
      }
    } else {
      if (!selectedUser) return;
      try {
        await sendAnnouncement({
          userId: selectedUser.id,
          mobileNumber: selectedUser.mobileNumber,
          message: message.trim(),
          templateName: 'general_notification'
        }).unwrap();
        
        toast.success(`Message sent to ${selectedUser.name}`);
        setMessage('');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to send message');
      }
    }
  };

  return (
    <div className="fixed inset-0 lg:left-64 top-16 sm:top-20 bottom-0 bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden z-20">
      <div className="flex-1 flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
        />
        <WhatsAppChatWindow 
          selectedUser={selectedUser}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          isSending={isSending}
          isSelectionMode={isSelectionMode}
          selectedUsersCount={selectedUsers.length}
        />
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
