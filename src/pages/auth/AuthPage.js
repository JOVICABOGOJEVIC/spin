import React from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/shared/LanguageSwitcher';
import LoginCompany from './LoginCompany';
import LoginCompanyNew from './LoginCompanyNew';
import LoginUser from './LoginUser';
import LoginWorker from './LoginWorker';
import LoginWorkerNew from './LoginWorkerNew';
import RegisterCompany from './RegisterCompany';
import RegisterCompanyNew from './RegisterCompanyNew';
import RegisterUser from './RegisterUser';

const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const role = searchParams.get("role");
    const type = searchParams.get("type");

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex-shrink-0"
              >
                <h1 className="text-2xl font-bold text-green-600 flex items-center cursor-pointer hover:text-green-500 transition-colors">
                  SpinT<span className="text-white mx-0.5 animate-spin-slow inline-block" style={{ fontSize: '0.67em' }}>@</span>sker
                </h1>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/auth?role=company&type=login')}
                className="text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('auth.login')}
              </button>
              <button
                onClick={() => navigate('/auth?role=worker&type=login')}
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('auth.loginForWorkers')}
              </button>
              <button
                onClick={() => navigate('/auth?role=company&type=register')}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {t('auth.register')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Forms */}
      <div className="min-h-[calc(100vh-4rem)]">
        {role === "user" && type === "login" && <LoginUser />}
        {role === "user" && type === "register" && <RegisterUser />}
        {role === "company" && type === "login" && <LoginCompanyNew />}
        {role === "company" && type === "register" && <RegisterCompanyNew />}
        {role === "worker" && type === "login" && <LoginWorkerNew />}
      </div>
    </div>
  )
}

export default AuthPage