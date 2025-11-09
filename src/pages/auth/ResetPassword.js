import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('form'); // form, success, error
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token za resetovanje lozinke nije pronađen.');
    }
  }, [searchParams]);

  const validatePassword = (pass) => {
    if (pass.length < 6) {
      return 'Lozinka mora imati najmanje 6 karaktera';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setErrors({ ...errors, password: validatePassword(value) });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value !== password) {
      setErrors({ ...errors, confirmPassword: 'Lozinke se ne poklapaju' });
    } else {
      setErrors({ ...errors, confirmPassword: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token za resetovanje lozinke nije pronađen.');
      return;
    }

    // Validacija
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Lozinke se ne poklapaju' });
      toast.error('Lozinke se ne poklapaju');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/company/reset-password`,
        { token, password }
      );

      if (response.data) {
        setStatus('success');
        setMessage(response.data.message || 'Lozinka je uspešno resetovana!');
        
        // Preusmeri na login nakon 3 sekunde
        setTimeout(() => {
          navigate('/auth?role=company&type=login');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Greška pri resetovanju lozinke. Token možda nije važeći ili je istekao.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          {status === 'form' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-blue-500 rounded-full p-4">
                  <Lock className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Resetujte lozinku
              </h2>
              <p className="text-gray-300 mb-6">
                Unesite novu lozinku za vaš nalog
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Nova lozinka
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Najmanje 6 karaktera"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Potvrdite lozinku
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`w-full px-4 py-3 pr-12 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Potvrdite lozinku"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Resetovanje...
                    </>
                  ) : (
                    'Resetuj lozinku'
                  )}
                </button>

                <div className="text-center">
                  <Link
                    to="/auth?role=company&type=login"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Nazad na prijavu
                  </Link>
                </div>
              </form>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-green-500 rounded-full p-4">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Lozinka resetovana!
              </h2>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Preusmeravamo vas na stranicu za prijavu...
              </p>
              <Link
                to="/auth?role=company&type=login"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Idi na prijavu
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-red-500 rounded-full p-4">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Greška
              </h2>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  to="/auth/forgot-password"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
                >
                  Zatraži novi link
                </Link>
                <Link
                  to="/auth?role=company&type=login"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
                >
                  Nazad na prijavu
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

