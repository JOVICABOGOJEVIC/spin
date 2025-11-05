import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Verifikacioni token nije pronađen.');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/company/verify-email`, {
          params: { token }
        });

        if (response.data) {
          setStatus('success');
          setMessage(response.data.message || 'Email je uspešno verifikovan!');
          setEmail(response.data.email || '');
          setCompanyName(response.data.companyName || '');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth?role=company&type=login');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Greška prilikom verifikacije emaila. Token možda nije važeći ili je istekao.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResend = async () => {
    const emailToResend = email || prompt('Unesite vašu email adresu:');
    
    if (!emailToResend) {
      toast.error('Email adresa je obavezna');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/auth/company/resend-verification`, {
        email: emailToResend
      });
      
      toast.success('Verifikacioni email je ponovo poslat. Proverite vašu poštu.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        'Greška prilikom slanja verifikacionog emaila.'
      );
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth?role=company&type=login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader className="h-16 w-16 text-blue-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Verifikacija emaila...
              </h2>
              <p className="text-gray-300">
                Molimo sačekajte dok verifikujemo vašu email adresu.
              </p>
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
                Email uspešno verifikovan!
              </h2>
              {companyName && (
                <p className="text-gray-300 mb-2">
                  Dobrodošli, {companyName}!
                </p>
              )}
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Preusmeravamo vas na stranicu za prijavu...
              </p>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Idi na prijavu
              </button>
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
                Greška pri verifikaciji
              </h2>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleResend}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Pošalji ponovo verifikacioni email
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Idi na prijavu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

