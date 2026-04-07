import React, { useState } from 'react';
import { useGetCitiesQuery } from '../../../services/apiSlice';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import AddMasterData from './AddMasterData';

const LocationList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery();
  const cities = citiesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Location Management</h1>
          <p className="text-sm text-gray-500 font-medium">Add and organize system locations for tracking donations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase">
                <th className="p-4 px-6 font-bold">City Name</th>
                <th className="p-4 px-6 font-bold">Type</th>
                <th className="p-4 px-6 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {citiesLoading ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : cities.length > 0 ? (
                cities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 px-6 font-bold text-gray-800">{city.name}</td>
                    <td className="p-4 px-6 text-sm text-gray-500 uppercase">{city.type}</td>
                    <td className="p-4 px-6 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500 text-sm">No locations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
