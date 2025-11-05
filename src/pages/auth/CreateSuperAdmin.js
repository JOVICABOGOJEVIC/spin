import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, UserPlus, Mail, Lock, Building2, Phone, MapPin, Briefcase } from 'lucide-react';
import { createSuperAdminPublic } from '../../redux/api';

const CreateSuperAdmin = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(null); // null = checking, true = exists, false = doesn't exist
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
    companyName: '',
    phone: '',
    city: '',
    address: '',
    businessType: 'Home Appliance Technician'
  });

  useEffect(() => {
    checkSuperAdminExists();
  }, []);

  const checkSuperAdminExists = async () => {
    try {
      // Try to check if super admin exists
      // For now, we'll allow creation if route is accessible
      // In production, you might want to add a specific endpoint for this
      setHasSuperAdmin(false);
    } catch (error) {
      console.error('Error checking super admin:', error);
      setHasSuperAdmin(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email i password su obavezni');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password mora biti najmanje 6 karaktera');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwordi se ne poklapaju');
      return;
    }

    try {
      setCreating(true);
      const { confirmPassword, ...adminData } = formData;
      await createSuperAdminPublic(adminData);
      toast.success('Super admin nalog je uspešno kreiran! Sada se možete prijaviti.');
      
      // Redirect to login after successful creation
      setTimeout(() => {
        navigate('/auth?role=company&type=login');
      }, 2000);
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Greška pri kreiranju naloga');
    } finally {
      setCreating(false);
    }
  };

  if (hasSuperAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-600 p-4 rounded-full">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Kreiranje Super Admin naloga
          </h1>
          <p className="text-gray-400">
            Kreiramo vaš prvi super admin nalog za upravljanje platformom
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email and Owner Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <UserPlus className="inline h-4 w-4 mr-1" />
                  Ime vlasnika
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Super Admin"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={6}
                  placeholder="Najmanje 6 karaktera"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Potvrdi Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={6}
                  placeholder="Ponovo unesite password"
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Ime kompanije
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="SpinTasker Admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+381601234567"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Grad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Beograd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adresa
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="N/A"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Tip biznisa
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Home Appliance Technician">Home Appliance Technician</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Auto Mechanic">Auto Mechanic</option>
                <option value="Elevator Technician">Elevator Technician</option>
                <option value="HVAC Technician">HVAC Technician</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Locksmith">Locksmith</option>
                <option value="Tile Installer">Tile Installer</option>
                <option value="Painter">Painter</option>
                <option value="Facade Specialist">Facade Specialist</option>
                <option value="IT Technician">IT Technician</option>
                <option value="Handyman">Handyman</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={creating}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Kreiranje naloga...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Kreiraj Super Admin nalog
                  </>
                )}
              </button>
            </div>

            {/* Link to Login */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Već imate nalog?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/auth?role=company&type=login')}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Prijavite se
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSuperAdmin;

