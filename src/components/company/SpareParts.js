import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getSpareParts, createSparePart, updateSparePart, deleteSparePart } from '../../redux/features/sparePartSlice';

const SpareParts = () => {
  const dispatch = useDispatch();
  const { items: spareParts, loading, error } = useSelector((state) => state.spareParts);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    purchasePrice: '',
    tax: '20',
    quantity: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    dispatch(getSpareParts());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        purchasePrice: parseFloat(formData.purchasePrice),
        tax: parseFloat(formData.tax),
        quantity: parseInt(formData.quantity)
      };

      console.log('Form data before conversion:', formData);
      console.log('Payload after conversion:', payload);

      if (editingPart) {
        const result = await dispatch(updateSparePart({ id: editingPart._id, ...payload })).unwrap();
        console.log('Update response:', result);
        toast.success('Rezervni deo uspešno ažuriran');
      } else {
        const result = await dispatch(createSparePart(payload)).unwrap();
        console.log('Create response:', result);
        toast.success('Rezervni deo uspešno dodat');
      }
      
      resetForm();
      dispatch(getSpareParts()); // Refresh the list
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Greška pri čuvanju rezervnog dela';
      toast.error(`Greška: ${errorMessage}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      price: '',
      purchasePrice: '',
      tax: '20',
      quantity: '',
      description: '',
      category: ''
    });
    setEditingPart(null);
    setShowForm(false);
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      code: part.code,
      price: part.price.toString(),
      purchasePrice: part.purchasePrice.toString(),
      tax: part.tax.toString(),
      quantity: part.quantity.toString(),
      description: part.description || '',
      category: part.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj rezervni deo?')) {
      try {
        await dispatch(deleteSparePart(id)).unwrap();
        toast.success('Rezervni deo uspešno obrisan');
      } catch (error) {
        toast.error(error.message || 'Greška pri brisanju rezervnog dela');
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Učitavanje...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upravljanje rezervnim delovima</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Dodaj novi deo
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">
            {editingPart ? 'Izmeni rezervni deo' : 'Dodaj novi rezervni deo'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Naziv</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Šifra</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nabavna cena (din)</label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Prodajna cena (din)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Porez (%)</label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
                min="0"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Količina</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Kategorija</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Opis</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                rows="3"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Otkaži
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingPart ? 'Sačuvaj' : 'Dodaj'} deo
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Naziv</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Šifra</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nabavna cena</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prodajna cena</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Porez</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Količina</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kategorija</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {spareParts.map((part) => (
              <tr key={part._id} className="text-gray-300">
                <td className="px-4 py-3 text-sm">{part.name}</td>
                <td className="px-4 py-3 text-sm">{part.code}</td>
                <td className="px-4 py-3 text-sm">{part.purchasePrice} din</td>
                <td className="px-4 py-3 text-sm">{part.price} din</td>
                <td className="px-4 py-3 text-sm">{part.tax}%</td>
                <td className="px-4 py-3 text-sm">{part.quantity}</td>
                <td className="px-4 py-3 text-sm">{part.category}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <button
                    onClick={() => handleEdit(part)}
                    className="text-blue-400 hover:text-blue-300 mr-3"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(part._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpareParts; 