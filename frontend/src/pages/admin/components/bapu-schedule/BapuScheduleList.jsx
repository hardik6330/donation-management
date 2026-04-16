import React from 'react';
import { Calendar, Phone, Clock, CheckCircle2, Trash2, Tag, MapPin, Edit, IndianRupee } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import { getStatusColor, getEventTypeColor } from '../../../../utils/tableUtils';

const BapuScheduleList = ({ 
  schedules, 
  isLoading, 
  isDeleting, 
  pagination, 
  filters, 
  onEdit, 
  onDelete, 
  onFilterChange, 
  onClearFilters, 
  onPageChange, 
  onLimitChange,
  hasPermission
}) => {

  const tableHeaders = [
    { label: 'Date & Time' },
    { label: 'Event Details' },
    { label: 'City' },
    { label: 'State' },
    { label: 'Country' },
    { label: 'Contact' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Status', className: 'text-center' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'startDate', label: 'Event Date', type: 'date', icon: Calendar },
    { name: 'city', label: 'City', icon: MapPin, placeholder: 'Search by city...' },
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
      <FilterSection 
        fields={filterFields} 
        filters={filters} 
        onFilterChange={onFilterChange} 
        onClearFilters={onClearFilters} 
      />

      <AdminTable 
        headers={tableHeaders} 
        isLoading={isLoading}
        emptyMessage="No schedules found."
      >
        {schedules.map((schedule) => (
          <tr key={schedule.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {new Date(schedule.date).toLocaleDateString('en-IN')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {schedule.time}
                </div>
              </div>
            </td>
            <td className="p-4 px-6">
              <div className="flex flex-col gap-1">
                <span className={`w-fit text-xs font-bold uppercase ${getEventTypeColor(schedule.eventType)}`}>
                  {schedule.eventType}
                </span>
                <span className="text-sm font-medium text-gray-700 line-clamp-1">
                  {schedule.description || 'No description'}
                </span>
              </div>
            </td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{schedule.city || '-'}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{schedule.state || '-'}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{schedule.country || '-'}</td>

            <td className="p-4 px-6">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-gray-800">{schedule.contactPerson}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5" />
                  {schedule.mobileNumber}
                </div>
              </div>
            </td>
            <td className="p-4 px-6 text-right">
              {schedule.amount ? (
                <div className="inline-flex items-center gap-0.5 text-sm font-bold text-blue-700">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {Number(schedule.amount).toLocaleString('en-IN')}
                </div>
              ) : (
                <span className="text-sm text-gray-400">-</span>
              )}
            </td>
            <td className="p-4 px-6 text-center">
              <span className={`text-xs font-bold uppercase ${getStatusColor(schedule.status)}`}>
                {schedule.status}
              </span>
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {hasPermission('bapuSchedule', 'entry') && (
                  <button
                    onClick={() => onEdit(schedule)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('bapuSchedule', 'full') && (
                  <button
                    onClick={() => onDelete(schedule.id)}
                    disabled={isDeleting}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination 
        pagination={pagination}
        filters={filters}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
};

export default BapuScheduleList;
