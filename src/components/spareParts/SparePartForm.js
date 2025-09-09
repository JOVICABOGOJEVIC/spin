import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createSparePart, updateSparePart } from '../../redux/features/sparePartSlice';
import { toast } from 'react-hot-toast';
import SparePartAutocomplete from './SparePartAutocomplete';

const SparePartForm = ({ isEdit, sparePart, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price: '',
    purchasePrice: '',
    tax: '',
    quantity: '',
    minQuantity: '',
    category: ''
  });
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (isEdit && sparePart) {
      setFormData(sparePart);
      setSearchValue(sparePart.name);
    }
  }, [isEdit, sparePart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSparePartSelect = (selectedPart) => {
    setFormData({
      ...formData,
      name: selectedPart.name,
      code: selectedPart.code,
      price: selectedPart.price.toString(),
      purchasePrice: selectedPart.purchasePrice.toString(),
      tax: selectedPart.tax.toString(),
      category: selectedPart.category,
      description: selectedPart.description || ''
    });
    setSearchValue(selectedPart.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'code', 'price', 'purchasePrice', 'tax', 'quantity', 'category', 'minQuantity'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Nedostaju obavezna polja: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const numericData = {
        ...formData,
        price: parseFloat(formData.price),
        purchasePrice: parseFloat(formData.purchasePrice),
        tax: parseFloat(formData.tax),
        quantity: parseInt(formData.quantity),
        minQuantity: parseInt(formData.minQuantity)
      };

      if (isEdit) {
        await dispatch(updateSparePart({ id: sparePart._id, ...numericData })).unwrap();
        toast.success('Rezervni deo je uspešno ažuriran');
      } else {
        await dispatch(createSparePart(numericData)).unwrap();
        toast.success('Rezervni deo je uspešno kreiran');
      }
      onClose();
    } catch (error) {
      toast.error(error.message || 'Greška pri čuvanju rezervnog dela');
    }
  };

  const baseInputClass = "w-full border border-gray-600 rounded px-2 py-1.5 text-xs text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-8";
  const labelClass = "block text-xs font-medium text-white mb-1";

  return (
    <div className="bg-gray-800 rounded-md shadow-sm mx-auto">
      <h2 className="text-xs font-semibold py-1.5 px-2 border-b border-gray-700 text-white flex items-center">
        {isEdit ? 'Izmena rezervnog dela' : 'Dodavanje novog rezervnog dela'}
      </h2>
      
      <form onSubmit={handleSubmit} className="px-2 py-1.5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Column 1: Basic Information */}
          <div className="bg-gray-700 p-1.5 rounded-md">
            <h3 className="text-xs font-semibold mb-1.5 text-white flex items-center">
              Osnovne informacije
            </h3>
            
            <div className="space-y-0">
              <div className="mb-2">
                <label className={labelClass}>Pretraga rezervnih delova</label>
                <SparePartAutocomplete
                  value={searchValue}
                  onChange={setSearchValue}
                  onSelect={handleSparePartSelect}
                />
              </div>

              <div className="mb-2">
                <label className={labelClass}>Naziv *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={baseInputClass}
                  required
                />
              </div>

              <div className="mb-2">
                <label className={labelClass}>Šifra *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={baseInputClass}
                  required
                />
              </div>

              <div className="mb-2">
                <label className={labelClass}>Kategorija *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={baseInputClass}
                  required
                />
              </div>

              <div className="mb-2">
                <label className={labelClass}>Opis</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${baseInputClass} h-[60px]`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Pricing and Inventory */}
          <div className="bg-gray-700 p-1.5 rounded-md">
            <h3 className="text-xs font-semibold mb-1.5 text-white flex items-center">
              Cene i zalihe
            </h3>
            
            <div className="space-y-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-2">
                  <label className={labelClass}>Cena *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={baseInputClass}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className={labelClass}>Nabavna cena *</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className={baseInputClass}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className={labelClass}>Porez (%) *</label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  className={baseInputClass}
                  step="0.01"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="mb-2">
                <label className={labelClass}>Količina *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={baseInputClass}
                  min="0"
                  required
                />
              </div>

              <div className="mb-2">
                <label className={labelClass}>Minimalna količina za obaveštenje</label>
                <input
                  type="number"
                  name="minQuantity"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  className={baseInputClass}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-2 pt-1.5 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Otkaži
          </button>
          <button
            type="submit"
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {isEdit ? 'Sačuvaj izmene' : 'Dodaj'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SparePartForm;