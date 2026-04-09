import React from 'react';
import { Calendar, Phone, Clock, CheckCircle2, Trash2, Tag, MapPin, Edit } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import { getStatusColor, getEventTypeColor } from '../../../../utils/tableUtils';

const BapuScheduleList = ({ 
  schedules, 
  isLoading, 
  isDeleting, 
  pagination,
  filters, 
  filterData,
  onEdit, 
  onDelete, 
  onFilterChange, 
  onClearFilters, 
  onPageChange,
  hasPermission 
}) => {
  const { cities = [], talukas = [], villages = [] } = filterData || {};

  const tableHeaders = [
    { label: 'Date & Time' },
    { label: 'Event Details' },
    { label: 'City' },
    { label: 'Taluka' },
    { label: 'Village' },
    { label: 'Contact' },
    { label: 'Status', className: 'text-center' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'startDate', label: 'Start Date', type: 'date', icon: Calendar },
    { 
      name: 'cityId', 
      label: 'City', 
      type: 'select', 
      icon: MapPin,
      options: cities.map(c => ({ value: c.id, label: c.name }))
    },
    { 
      name: 'talukaId', 
      label: 'Taluka', 
      type: 'select', 
      icon: MapPin,
      options: talukas.map(t => ({ value: t.id, label: t.name }))
    },
    { 
      name: 'villageId', 
      label: 'Village', 
      type: 'select', 
      icon: MapPin,
      options: villages.map(v => ({ value: v.id, label: v.name }))
    },
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
            <td className="p-4 px-6">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <td className="px-1 py-4 text-sm text-gray-500 uppercase">{schedule.city || '-'}</td>
              </div>
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <td className="px-1py-4 text-sm text-gray-500 uppercase">{schedule.taluka || '-'}</td>
              </div>
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <td className="px-1 py-4 text-sm text-gray-500 uppercase">{schedule.village || '-'}</td>
              </div>
            </td>

            <td className="p-4 px-6">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-gray-800">{schedule.contactPerson}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5" />
                  {schedule.mobileNumber}
                </div>
              </div>
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

      {pagination?.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-blue-600">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> records
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={filters.page === 1}
              onClick={() => onPageChange(filters.page - 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 text-sm font-bold rounded-lg transition ${
                  filters.page === page
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => onPageChange(filters.page + 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BapuScheduleList;
