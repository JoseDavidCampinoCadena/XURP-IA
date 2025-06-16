"use client";
import React from "react";
import MiniSidebar from "../components/MiniSidebar";
import { useTheme } from "@/app/contexts/ThemeContext";
import Link from "next/link";

const SecuritySettings = () => {
  const { theme } = useTheme();

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <MiniSidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center mb-4">
          
          <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12">Seguridad</h1>
        </div>

        <div className="p-4 rounded-lg mt-4 space-y-4">
          <Link 
            href="/home/settings/security/change-password" 
            className={`block p-3 border rounded-lg transition-colors ${theme === 'dark' ? 'border-green-300 hover:bg-green-800/20' : 'border-green-400 hover:bg-green-50'}`}
          >
            Cambiar contraseña
          </Link>
          
          <Link 
            href="/home/settings/security/delete-account" 
            className={`block p-3 border rounded-lg transition-colors ${theme === 'dark' ? 'border-red-600 text-red-500 hover:bg-red-800 hover:text-white' : 'border-red-400 text-red-600 hover:bg-red-50'}`}
          >
            Eliminar cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
