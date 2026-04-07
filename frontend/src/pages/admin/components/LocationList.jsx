import React, { useState } from 'react';
import { useGetCitiesQuery } from '../../../services/apiSlice';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import AddMasterData from './AddMasterData';
import AdminPageHeader from '../../../components/common/AdminPageHeader';
import AdminTable from '../../../components/common/AdminTable';

const LocationList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery();
  const cities = citiesData?.data || [];

  const tableHeaders = [
    { label: 'City Name' },
    { label: 'Type' },
    { label: 'Status', className: 'text-center' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Location Management" 
        subtitle="Add and organize system locations for tracking donations"
        buttonText="Add Location"
        onButtonClick={() => setIsModalOpen(true)}
      />

      <AdminTable 
        headers={tableHeaders} 
        isLoading={citiesLoading}
        emptyMessage="No locations found."
      >
        {cities.map((city) => (
          <tr key={city.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800">{city.name}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{city.type}</td>
            <td className="p-4 px-6 text-center">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                Active
              </span>
            </td>
          </tr>
        ))}
      </AdminTable>

      {isModalOpen && (
        <AddMasterData 
          type="location" 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default LocationList;
