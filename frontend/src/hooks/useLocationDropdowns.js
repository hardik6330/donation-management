import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to manage hierarchical location dropdowns (Country > State > City)
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
    countryId: initialValues.countryId || '',
    stateId: initialValues.stateId || '',
    cityId: initialValues.cityId || '',
  });

  // Dropdown Label State
  const [locationLabels, setLocationLabels] = useState({
    countryName: initialValues.countryName || '',
    stateName: initialValues.stateName || '',
    cityName: initialValues.cityName || '',
  });

  // Refs for navigation
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  // Sync with initial values if they change (e.g., when editing or user auto-fill)
  useEffect(() => {
    if (initialValues.countryId !== undefined || initialValues.stateId !== undefined || initialValues.cityId !== undefined) {
      setLocationForm(prev => ({
        ...prev,
        countryId: initialValues.countryId || prev.countryId,
        stateId: initialValues.stateId || prev.stateId,
        cityId: initialValues.cityId || prev.cityId,
      }));
      setLocationLabels(prev => ({
        ...prev,
        countryName: initialValues.countryName || prev.countryName,
        stateName: initialValues.stateName || prev.stateName,
        cityName: initialValues.cityName || prev.cityName,
      }));
    }
  }, [initialValues.countryId, initialValues.stateId, initialValues.cityId, initialValues.countryName, initialValues.stateName, initialValues.cityName]);

  const handleLocationInputChange = (name, value) => {
    if (name === 'countryName') {
      setLocationLabels(prev => ({ ...prev, countryName: value, stateName: '', cityName: '' }));
      setLocationForm(prev => ({ ...prev, countryId: '', stateId: '', cityId: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, countryId: '', stateId: '', cityId: '' }));
      return 'countryName';
    }
    if (name === 'stateName') {
      setLocationLabels(prev => ({ ...prev, stateName: value, cityName: '' }));
      setLocationForm(prev => ({ ...prev, stateId: '', cityId: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, stateId: '', cityId: '' }));
      return 'stateName';
    }
    if (name === 'cityName') {
      setLocationLabels(prev => ({ ...prev, cityName: value }));
      setLocationForm(prev => ({ ...prev, cityId: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, cityId: '' }));
      return 'cityName';
    }
    return null;
  };

  const handleLocationSelect = (field, id, name) => {
    let nextRef = null;

    if (field === 'countryId') {
      setLocationForm(prev => ({ ...prev, countryId: id, stateId: '', cityId: '' }));
      setLocationLabels(prev => ({ ...prev, countryName: name, stateName: '', cityName: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, countryId: id, stateId: '', cityId: '' }));
      if (talukaPagination?.reset) talukaPagination.reset();
      if (villagePagination?.reset) villagePagination.reset();
      nextRef = stateRef;
    } else if (field === 'stateId') {
      setLocationForm(prev => ({ ...prev, stateId: id, cityId: '' }));
      setLocationLabels(prev => ({ ...prev, stateName: name, cityName: '' }));
      if (setModalState) setModalState(prev => ({ ...prev, stateId: id, cityId: '' }));
      if (villagePagination?.reset) villagePagination.reset();
      nextRef = cityRef;
    } else if (field === 'cityId') {
      setLocationForm(prev => ({ ...prev, cityId: id }));
      setLocationLabels(prev => ({ ...prev, cityName: name }));
      if (setModalState) setModalState(prev => ({ ...prev, cityId: id }));
    }

    if (onSelectCallback) {
      onSelectCallback(field, id, name);
    }

    return nextRef;
  };

  const resetLocations = () => {
    setLocationForm({ countryId: '', stateId: '', cityId: '' });
    setLocationLabels({ countryName: '', stateName: '', cityName: '' });
    if (setModalState) setModalState(prev => ({ ...prev, countryId: '', stateId: '', cityId: '' }));
  };

  return {
    locationForm,
    locationLabels,
    setLocationForm,
    setLocationLabels,
    countryRef,
    stateRef,
    cityRef,
    handleLocationInputChange,
    handleLocationSelect,
    resetLocations
  };
};
