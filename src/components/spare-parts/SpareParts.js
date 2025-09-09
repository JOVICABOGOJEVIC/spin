import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSpareParts, createSparePart, updateSparePart, deleteSparePart } from '../../actions/sparePartActions';
import SparePartForm from './SparePartForm';
import Spinner from '../layout/Spinner';

const SpareParts = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [quickAdd, setQuickAdd] = useState({
    name: '',
    price: '',
    purchasePrice: '',
    tax: '',
    quantity: ''
  });

  const { spareParts, loading } = useSelector(state => state.sparePart);

  useEffect(() => {
    dispatch(getSpareParts());
  }, [dispatch]);

  const handleQuickAddChange = (e) => {
    setQuickAdd({
      ...quickAdd,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createSparePart(quickAdd));
      setQuickAdd({
        name: '',
        price: '',
        purchasePrice: '',
        tax: '',
        quantity: ''
      });
      toast.success('Spare part added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding spare part');
    }
  };

  const handleEdit = (part) => {
    setSelectedPart(part);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this spare part?')) {
      try {
        await dispatch(deleteSparePart(id));
        toast.success('Spare part deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting spare part');
      }
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedPart(null);
    setShowModal(true);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Quick Add Spare Part</h2>
        <form onSubmit={handleQuickAddSubmit} className="grid grid-cols-6 gap-4">
          <input
            type="text"
            name="name"
            value={quickAdd.name}
            onChange={handleQuickAddChange}
            placeholder="Name"
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="price"
            value={quickAdd.price}
            onChange={handleQuickAddChange}
            placeholder="Price"
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="purchasePrice"
            value={quickAdd.purchasePrice}
            onChange={handleQuickAddChange}
            placeholder="Purchase Price"
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="tax"
            value={quickAdd.tax}
            onChange={handleQuickAddChange}
            placeholder="Tax %"
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="quantity"
            value={quickAdd.quantity}
            onChange={handleQuickAddChange}
            placeholder="Quantity"
            className="border rounded p-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
          >
            <Plus className="inline-block mr-2" size={16} />
            Add
          </button>
        </form>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Spare Parts List</h2>
        <button
          onClick={handleAdd}
          className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
        >
          <Plus className="inline-block mr-2" size={16} />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spareParts.map((part) => (
          <div key={part._id} className="border rounded p-4 shadow">
            <h3 className="text-xl font-semibold mb-2">{part.name}</h3>
            <p className="text-gray-600 mb-1">Price: ${part.price}</p>
            <p className="text-gray-600 mb-1">Purchase Price: ${part.purchasePrice}</p>
            <p className="text-gray-600 mb-1">Tax: {part.tax}%</p>
            <p className="text-gray-600 mb-1">Quantity: {part.quantity}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(part)}
                className="bg-yellow-500 text-white rounded p-2 hover:bg-yellow-600"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(part._id)}
                className="bg-red-500 text-white rounded p-2 hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <SparePartForm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sparePart={selectedPart}
          isEdit={editMode}
        />
      )}
    </div>
  );
};

export default SpareParts; 