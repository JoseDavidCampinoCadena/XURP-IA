"use client";
import React from "react";
import Link from "next/link";
import { useTheme } from "@/app/contexts/ThemeContext";
import MiniSidebar from "../components/MiniSidebar";


const NotificationsPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Contenido */}
      <div className="flex-1 p-6">
        <h1 className="text-[#26D07C] text-2xl font-bold mb-4 mt-12">Notificaciones</h1>

        {/* Sección de Notificaciones */}
        <div>
         

          {/* Opciones */}
          <div className={`border-2 p-4 rounded-lg mt-4 ${theme === 'dark' ? 'border-green-300' : 'border-green-400 bg-green-50/50'}`}>
            <Link href="/home/settings/notifications/push">
              <div className={`flex justify-between items-center p-3 cursor-pointer rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-green-100'}`}>
                <span>Notificaciones Push</span>
                <span>➜</span>
              </div>
            </Link>

            <Link href="/home/settings/notifications/email">
              <div className={`flex justify-between items-center p-3 cursor-pointer rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-green-100'}`}>
                <span>Notificaciones del Email</span>
                <span>➜</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
