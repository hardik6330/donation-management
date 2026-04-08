import React, { useState } from 'react';
import { 
  useGetBapuSchedulesQuery, 
  useUpdateBapuScheduleMutation, 
  useDeleteBapuScheduleMutation
} from '../../../../services/apiSlice';
import { Calendar, Phone, Clock, CheckCircle2, X, Loader2, Trash2, ChevronDown, Filter, Search, Tag, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import AddBapuScheduleModal from './AddBapuScheduleModal';

const BapuScheduleList = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    status: '',
    locationId: ''
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: schedulesData, isLoading: loading } = useGetBapuSchedulesQuery(filters);
  const [updateSchedule] = useUpdateBapuScheduleMutation();
  const [deleteSchedule] = useDeleteBapuScheduleMutation();

  const schedules = schedulesData?.data || [];

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateSchedule({ id, status }).unwrap();
      toast.success(`Schedule marked as ${status}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(id).unwrap();
        toast.success('Schedule deleted successfully');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete schedule');
      }
    }
  };

  const tableHeaders = [
    { label: 'Date & Time' },
    { label: 'Event Type' },
    { label: 'Location' },
    { label: 'Contact Person' },
    { label: 'Status' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'startDate', label: 'Start Date', type: 'date', icon: Calendar },
    { 
      name: 'eventType', 
      label: 'Event Type', 
      type: 'select', 
      icon: Tag,
      options: [
        { value: 'Padhramani', label: 'Padhramani' },
        { value: 'Katha', label: 'Katha' },
        { value: 'Event', label: 'Event' },
        { value: 'Personal', label: 'Personal' }
      ]
    },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      icon: CheckCircle2,
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Bapu's Schedule" 
        subtitle="Manage and track all upcoming events and padhramani"
        buttonText="Add Schedule"
        onButtonClick={() => setIsAddModalOpen(true)}
      />

      <FilterSection
        filters={filters}
        onFilterChange={(e) => {
          const { name, value } = e.target;
          setFilters(prev => ({ ...prev, [name]: value }));
        }}
        onClearFilters={() => setFilters({ startDate: '', endDate: '', eventType: '', status: '', locationId: '' })}
        fields={filterFields}
      />

      <AdminTable headers={tableHeaders} isLoading={loading}>
        {schedules.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition">
            <td className="p-4">
              <div className="font-bold text-gray-800">{new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {item.time || 'Time TBD'}
              </div>
            </td>
            <td className="p-4">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                item.eventType === 'Padhramani' ? 'bg-purple-100 text-purple-600' :
                item.eventType === 'Katha' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {item.eventType}
              </span>
            </td>
            <td className="p-4">
              <div className="text-sm font-medium text-gray-800">{item.location?.name || 'Multiple Locations'}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </td>
            <td className="p-4">
              <div className="text-sm font-medium">{item.contactPerson || '-'}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {item.mobileNumber || '-'}
              </div>
            </td>
            <td className="p-4">
              <span className={`text-[10px] font-bold uppercase ${
                item.status === 'completed' ? 'text-green-600' :
                item.status === 'cancelled' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {item.status}
              </span>
            </td>
            <td className="p-4">
              <div className="flex items-center gap-2">
                {item.status === 'scheduled' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'completed')}
                    className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition"
                    title="Mark Completed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <AddBapuScheduleModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default BapuScheduleList;
