import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSpareParts, deleteSparePart, createSparePart, updateSparePart } from '../../redux/features/sparePartSlice';
import { Pencil, Trash2, Plus, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SparePartForm from './SparePartForm';

const SparePartList = () => {
  const dispatch = useDispatch();
  const { items: spareParts, loading } = useSelector((state) => {
    console.log('Redux State:', state);
    return state.spareParts || { items: [], loading: false };
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState(null);

  useEffect(() => {
    dispatch(getSpareParts());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedSparePart(null);
    setShowForm(true);
  };

  const handleEdit = (sparePart) => {
    setSelectedSparePart(sparePart);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj rezervni deo?')) {
      try {
        await dispatch(deleteSparePart(id)).unwrap();
        toast.success('Rezervni deo je uspešno obrisan');
      } catch (error) {
        toast.error(error.message || 'Greška pri brisanju rezervnog dela');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedSparePart(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCloseForm}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to List
          </button>
          <h2 className="text-lg font-semibold">
            {selectedSparePart ? 'Edit Spare Part' : 'Add New Spare Part'}
          </h2>
        </div>
        <SparePartForm
          isEdit={!!selectedSparePart}
          sparePart={selectedSparePart}
          onClose={handleCloseForm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Spare Parts</h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Spare Part
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full bg-gray-800 shadow-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">Name</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">Code</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">Category</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">Price</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">Purchase Price</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">Tax (%)</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">Quantity</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-right">Min Quantity</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {spareParts.map((sparePart) => (
              <tr key={sparePart._id} className="hover:bg-gray-700">
                <td className="px-4 py-2 text-sm">
                  <div>
                    <div className="font-medium text-white">{sparePart.name}</div>
                    {sparePart.description && (
                      <div className="text-xs text-gray-400">{sparePart.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-300">{sparePart.code}</td>
                <td className="px-4 py-2 text-sm text-gray-300">{sparePart.category}</td>
                <td className="px-4 py-2 text-sm text-gray-300 text-right">{sparePart.price?.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-300 text-right">{sparePart.purchasePrice?.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-300 text-right">{sparePart.tax}</td>
                <td className="px-4 py-2 text-sm text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <span className={sparePart.quantity <= sparePart.minQuantity ? 'text-red-400 font-medium' : 'text-gray-300'}>
                      {sparePart.quantity}
                    </span>
                    {sparePart.quantity <= sparePart.minQuantity && (
                      <div className="group relative">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            Količina je ispod minimalne ({sparePart.minQuantity})
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-300 text-right">{sparePart.minQuantity}</td>
                <td className="px-4 py-2 text-sm text-right">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(sparePart)}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sparePart._id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SparePartList; 