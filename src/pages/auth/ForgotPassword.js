import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Molimo unesite vašu email adresu');
      return;
    }

    // Validacija email formata
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Molimo unesite validnu email adresu');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/company/forgot-password`,
        { email }
      );

      if (response.data) {
        setEmailSent(true);
        toast.success('Email sa linkom za resetovanje lozinke je poslat na vašu adresu');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        'Greška pri slanju emaila. Molimo pokušajte ponovo.';
      
      if (error.response?.status === 400) {
        toast.error(errorMessage);
      } else {
        // Uvek pokaži uspešnu poruku zbog sigurnosti
        setEmailSent(true);
        toast.success('Ako email postoji, link za resetovanje je poslat na vašu adresu');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500 rounded-full p-3">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Zaboravljena lozinka?
          </h2>
          <p className="text-gray-300">
            {emailSent 
              ? 'Proverite vašu email adresu' 
              : 'Unesite vašu email adresu i poslaćemo vam link za resetovanje lozinke'}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email adresa
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="vas.email@domen.com"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Slanje...
                </>
              ) : (
                'Pošalji link za resetovanje'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/auth?role=company&type=login"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Nazad na prijavu
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                Poslali smo link za resetovanje lozinke na adresu <strong className="text-white">{email}</strong>.
                Molimo proverite vašu poštu i kliknite na link.
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-400 text-sm">
                Niste primili email? Proverite spam folder ili pokušajte ponovo.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Pošalji ponovo
              </button>
            </div>

            <Link
              to="/auth?role=company&type=login"
              className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Nazad na prijavu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

