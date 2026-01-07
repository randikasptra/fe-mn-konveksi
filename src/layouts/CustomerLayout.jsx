// src/layouts/CustomerLayout.jsx
import React from 'react';
import CustomerNavbar from '../components/customer/Navbar';
import Footer from '../components/common/Footer';
import { Outlet } from 'react-router-dom';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;