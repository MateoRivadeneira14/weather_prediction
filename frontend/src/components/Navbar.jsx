
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 flex gap-6">
      <Link to="/" className="hover:underline">Inicio</Link>
      <Link to="/modelo" className="hover:underline">Sobre el modelo</Link>
    </nav>
  );
};

export default Navbar;
