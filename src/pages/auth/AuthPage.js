import React from 'react';
import { useSearchParams } from "react-router-dom";
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
    const role = searchParams.get("role");
    const type = searchParams.get("type");

  return (
    <div>
    {role === "user" && type === "login" && <LoginUser />}
    {role === "user" && type === "register" && <RegisterUser />}
    {role === "company" && type === "login" && <LoginCompanyNew />}
    {role === "company" && type === "register" && <RegisterCompanyNew />}
    {role === "worker" && type === "login" && <LoginWorkerNew />}
  </div>
  )
}

export default AuthPage