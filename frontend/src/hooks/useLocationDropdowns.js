import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to manage hierarchical location dropdowns (City > Taluka > Village)
 * and their respective refs for form navigation.
 */
export const useLocationDropdowns = ({ 
  initialValues = {}, 
  cityPagination, 
  talukaPagination, 
  villagePagination,
  setModalState,
  onSelectCallback = null 
}) => {
  // Form State
  const [locationForm, setLocationForm] = useState({
    cityId: initialValues.cityId || '',
    talukaId: initialValues.talukaId || '',
    villageId: initialValues.villageId || '',
  });

  // Dropdown Label State
  const [locationLabels, setLocationLabels] = useState({
    cityName: initialValues.cityName || '',
    talukaName: initialValues.talukaName || '',
    villageName: initialValues.villageName || '',
  });

  // Refs for navigation
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef = useRef(null);

  // Sync with initial values if they change (e.g., when editing or user auto-fill)
  useEffect(() => {
    if (initialValues.cityId !== undefined || initialValues.talukaId !== undefined || initialValues.villageId !== undefined) {
      setLocationForm(prev => ({
        ...prev,
        cityId: initialValues.cityId || prev.cityId,
        talukaId: initialValues.talukaId || prev.talukaId,
        villageId: initialValues.villageId || prev.villageId,
      }));
      setLocationLabels(prev => ({
        ...prev,
        cityName: initialValues.cityName || prev.cityName,
        talukaName: initialValues.talukaName || prev.talukaName,
        villageName: initialValues.villageName || prev.villageName,
      }));
    }
  }, [initialValues.cityId, initialValues.talukaId, initialValues.villageId, initialValues.cityName, initialValues.talukaName, initialValues.villageName]);

  const handleLocationInputChange = (name, value) => {
    if (name === 'cityName') {
      setLocationLabels(prev => ({ ...prev, cityName: value, talukaName: '', villageName: '' }));
      setLocationForm(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '' }));
      return 'cityName';
    }
    if (name === 'talukaName') {
      setLocationLabels(prev => ({ ...prev, talukaName: value, villageName: '' }));
      setLocationForm(prev => ({ ...prev, talukaId: '', villageId: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, talukaId: '', villageId: '' }));
      return 'talukaName';
    }
    if (name === 'villageName') {
      setLocationLabels(prev => ({ ...prev, villageName: value }));
      setLocationForm(prev => ({ ...prev, villageId: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, villageId: '' }));
      return 'villageName';
    }
    return null;
  };

  const handleLocationSelect = (field, id, name) => {
    let nextRef = null;

    if (field === 'cityId') {
      setLocationForm(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '' }));
      setLocationLabels(prev => ({ ...prev, cityName: name, talukaName: '', villageName: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '' }));
      if (talukaPagination?.reset) talukaPagination.reset();
      if (villagePagination?.reset) villagePagination.reset();
      nextRef = talukaRef;
    } else if (field === 'talukaId') {
      setLocationForm(prev => ({ ...prev, talukaId: id, villageId: '' }));
      setLocationLabels(prev => ({ ...prev, talukaName: name, villageName: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, talukaId: id, villageId: '' }));
      if (villagePagination?.reset) villagePagination.reset();
      nextRef = villageRef;
    } else if (field === 'villageId') {
      setLocationForm(prev => ({ ...prev, villageId: id }));
      setLocationLabels(prev => ({ ...prev, villageName: name }));
      if (setModalState) setModalState(prev => ({ ...prev, villageId: id }));
    }

    if (onSelectCallback) {
      onSelectCallback(field, id, name);
    }

    return nextRef;
  };

  const resetLocations = () => {
    setLocationForm({ cityId: '', talukaId: '', villageId: '' });
    setLocationLabels({ cityName: '', talukaName: '', villageName: '' });
    if (setModalState) setModalState(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '' }));
  };

  return {
    locationForm,
    locationLabels,
    setLocationForm,
    setLocationLabels,
    cityRef,
    talukaRef,
    villageRef,
    handleLocationInputChange,
    handleLocationSelect,
    resetLocations
  };
};
