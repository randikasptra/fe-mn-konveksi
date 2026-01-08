// src/layouts/CheckoutLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Icon } from "@iconify/react";

const CheckoutLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Steps configuration
  const steps = [
    { number: 1, title: "Informasi", path: "/checkout" },
    { number: 2, title: "Pembayaran", path: "/checkout/payment" },
    { number: 3, title: "Konfirmasi", path: "/checkout/confirmation" },
  ];

  // Update current step based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("payment")) setCurrentStep(2);
    else if (path.includes("confirmation")) setCurrentStep(3);
    else setCurrentStep(1);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Checkout Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:needle" className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  MN KONVEKSI
                </h1>
                <p className="text-xs text-gray-500">Checkout</p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(step.path)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}>
                    {step.number}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {step.number < 3 && (
                    <Icon icon="mdi:chevron-right" className="text-gray-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Cart icon with count */}
            <div className="relative">
              <Link to="/keranjang" className="p-2 hover:bg-gray-100 rounded-xl">
                <Icon icon="mdi:cart-outline" className="text-gray-600 text-xl" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Steps */}
      <div className="md:hidden bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => navigate(step.path)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-1 ${
                  currentStep >= step.number
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}>
                  {step.number}
                </div>
                <span className={`text-xs font-medium ${
                  currentStep >= step.number
                    ? "text-gray-900"
                    : "text-gray-500"
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 MN Konveksi. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon icon="mdi:shield-check" className="text-emerald-500" />
                <span>Pembayaran Aman</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon icon="mdi:headset" className="text-indigo-500" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutLayout;