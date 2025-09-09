import React, { useState } from "react";
import {  X, Package, Wrench, Factory, User } from "lucide-react";
import './header.css';
const HeaderAdmin = ({setOne, setTwo, setThree, setFour, showOne, showTwo, showThree, showFour }) => {
  console.log('log header admin');
  
  
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-[var(--color-background)] text-primary shadow-md">
    <button onClick={setOne} className="p-2">
      {showOne ? <Wrench color="gold" size={22} /> :  <Wrench size={22} />}
    </button>
    <button onClick={setTwo} className="p-2">
      {showTwo ? <Factory color="gold" size={22} /> : <Factory size={22} />}
    </button>
    <button onClick={setThree} className="p-2">
      {showThree ? <Package color="gold" size={22} /> : <Package size={22} />}
    </button>
    <button onClick={setFour} className="p-2">
      {showFour ? <User color="gold" size={22} /> : <User size={22} />}
    </button>
  </header>
  )
}

export default HeaderAdmin