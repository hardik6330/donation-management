import React, { useState } from 'react';
import LocationList from './LocationList';
import AddLocationModal from './AddLocationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetCitiesQuery, useDeleteLocationMutation } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const Location = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // API calls moved to index.jsx
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery();
  const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();
  const cities = citiesData?.data || [];

  const handleAdd = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this city? This will only delete the city if it has no sub-locations or donations.')) {
      try {
        await deleteLocation(id).unwrap();
        toast.success('City deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete city');
      }
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Location Management" 
        subtitle="Add and organize system locations for tracking donations"
        buttonText={hasPermission('location', 'entry') ? "Add Location" : null}
        onButtonClick={handleAdd}
      />

      <LocationList 
        cities={cities}
        isLoading={citiesLoading}
        isDeleting={isDeleting}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddLocationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingData={editingLocation}
          key={editingLocation?.id || 'new'}
        />
      )}
    </div>
  );
};

export default Location;
