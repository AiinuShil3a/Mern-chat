import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">CHAT WITH ME FREE WIFI</div>
        <div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Login</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
