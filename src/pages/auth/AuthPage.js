import React from 'react';
import { useSearchParams } from "react-router-dom";
import LoginCompany from './LoginCompany';
import LoginUser from './LoginUser';
import RegisterCompany from './RegisterCompany';
import RegisterUser from './RegisterUser';

const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role");
    const type = searchParams.get("type");

  return (
    <div>
    {role === "user" && type === "login" && <LoginUser />}
    {role === "user" && type === "register" && <RegisterUser />}
    {role === "company" && type === "login" && <LoginCompany />}
    {role === "company" && type === "register" && <RegisterCompany />}
  </div>
  )
}

export default AuthPage