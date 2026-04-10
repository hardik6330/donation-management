import React, { useState } from 'react';
import LocationList from './LocationList';
import AddLocationModal from './AddLocationModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetCitiesQuery, useGetSubLocationsQuery, useDeleteLocationMutation } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';
import { ChevronRight, Home } from 'lucide-react';

const Location = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  // Breadcrumb navigation state
  const [breadcrumb, setBreadcrumb] = useState([]); // [{ id, name, type }]
  const currentParent = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : null;

  // API calls
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery();
  const { data: subLocationsData, isLoading: subLoading } = useGetSubLocationsQuery(
    currentParent?.id,
    { skip: !currentParent }
  );
  const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();

  const cities = citiesData?.data || [];
  const subLocations = subLocationsData?.data || [];

  const locations = currentParent ? subLocations : cities;
  const isLoading = currentParent ? subLoading : citiesLoading;

  // Determine what type of children we're viewing
  const currentLevel = breadcrumb.length === 0 ? 'city' : breadcrumb.length === 1 ? 'taluka' : 'village';
  const canDrillDown = currentLevel !== 'village';

  const handleDrillDown = (location) => {
    setBreadcrumb(prev => [...prev, { id: location.id, name: location.name, type: location.type }]);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBreadcrumb([]);
    } else {
      setBreadcrumb(prev => prev.slice(0, index + 1));
    }
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLocation(deletingId).unwrap();
      toast.success('Location deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete location');
    }
  };

  const getSubtitle = () => {
    if (currentLevel === 'city') return 'Manage cities - click View to see talukas';
    if (currentLevel === 'taluka') return `Talukas in ${currentParent.name} - click View to see villages`;
    return `Villages in ${currentParent.name}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Location Management"
        subtitle={getSubtitle()}
        buttonText={hasPermission('location', 'entry') ? "Add Location" : null}
        onButtonClick={handleAdd}
      />

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 text-sm bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition"
          >
            <Home className="w-3.5 h-3.5" />
            Cities
          </button>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.id}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`font-semibold transition capitalize ${
                  index === breadcrumb.length - 1 ? 'text-gray-500 cursor-default' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      <LocationList
        locations={locations}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleDrillDown}
        canViewSub={canDrillDown}
        hasPermission={hasPermission}
      />

      {isModalOpen && (
        <AddLocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingData={editingLocation}
          parentId={currentParent?.id}
          level={currentLevel}
          key={editingLocation?.id || 'new'}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone and will only work if it has no sub-locations or linked donations."
      />
    </div>
  );
};

export default Location;
