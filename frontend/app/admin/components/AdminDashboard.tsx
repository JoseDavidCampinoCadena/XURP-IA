'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
import { useAuth } from '@/app/hooks/useAuth';
import { useTheme } from '@/app/contexts/ThemeContext';
import { FaUsers, FaProjectDiagram, FaTasks, FaChartLine, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import { Project } from '@/app/hooks/useProjects';

interface AdminDashboardProps {
  project?: Project;
}

export default function AdminDashboard({ project: providedProject }: AdminDashboardProps) {
  const { projects } = useProjects();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCollaborators: 0,
    totalTasks: 0
  });

  // Use provided project or fall back to first project from useProjects
  const currentProject = providedProject || (projects && projects.length > 0 ? projects[0] : null);
  const currentProjectId = currentProject ? currentProject.id : null;
  const isOwner = user && currentProject && user.id === currentProject.ownerId;

  useEffect(() => {
    const calculateStats = () => {
      setStats({
        totalProjects: projects.length,
        totalCollaborators: currentProject?.collaborators?.length || 0,
        totalTasks: currentProject?.tasks?.length || 0
      });
    };
    calculateStats();
  }, [projects, currentProject]);
  if (!currentProject) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className={`p-6 md:p-8 rounded-xl border max-w-md mx-auto ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            <FaProjectDiagram className={`text-4xl md:text-6xl mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            <h2 className={`text-xl md:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              No hay proyectos disponibles
            </h2>
            <p className={`text-sm md:text-base mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Necesitas tener al menos un proyecto para acceder al panel de administración.
            </p>
            <Link 
              href="/home/addproject"
              className="inline-block bg-gradient-to-r from-[#26D07C] to-[#20B369] hover:from-[#20B369] hover:to-[#1AA05E] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all duration-300 font-medium"
            >
              Crear Proyecto
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`p-4 md:p-6 lg:p-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
        <div className="flex-1">
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            🚀 Panel de Administración
          </h1>
          <p className={`text-sm md:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona tu proyecto y colaboradores de manera eficiente
          </p>
        </div>
        
        {/* Project info card */}
        <div className={`w-full lg:w-auto lg:min-w-[280px] xl:min-w-[320px] rounded-xl p-4 md:p-6 border shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${isOwner ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
            <h3 className={`font-bold text-sm md:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isOwner ? '👑 Tu Proyecto' : '🤝 Colaborando en'}
            </h3>
          </div>
          <p className={`font-semibold text-base md:text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {currentProject.name}
          </p>
          <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>Propietario:</strong> {currentProject.owner?.name || 'Usuario desconocido'}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            ID: {currentProject.id}
          </p>
        </div>
      </div>      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <FaProjectDiagram className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className={`text-xs md:text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Proyectos</p>
              <p className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <FaUsers className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className={`text-xs md:text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Colaboradores</p>
              <p className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalCollaborators}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl sm:col-span-2 lg:col-span-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <FaTasks className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className={`text-xs md:text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tareas</p>
              <p className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalTasks}</p>
            </div>
          </div>
        </div>
      </div>      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <Link href={`/admin/projects/${currentProjectId}/collaborators`} className="group">
          <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02] ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-blue-900/30 group-hover:bg-blue-800/40' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                <FaUsers className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-base md:text-lg font-semibold ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                👥 Colaboradores
              </h3>
            </div>
            <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona los miembros del equipo y sus permisos
            </p>
            <div className={`mt-4 text-xs font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.totalCollaborators} miembro{stats.totalCollaborators !== 1 ? 's' : ''} activo{stats.totalCollaborators !== 1 ? 's' : ''}
            </div>
          </div>
        </Link>

        <Link href={`/admin/projects/${currentProjectId}/ai-tasks`} className="group">
          <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02] ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-green-900/30 group-hover:bg-green-800/40' : 'bg-green-100 group-hover:bg-green-200'}`}>
                <FaTasks className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-base md:text-lg font-semibold ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📋 Tareas
              </h3>
            </div>
            <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Administra las tareas y el progreso del proyecto
            </p>
            <div className={`mt-4 text-xs font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {stats.totalTasks} tarea{stats.totalTasks !== 1 ? 's' : ''} registrada{stats.totalTasks !== 1 ? 's' : ''}
            </div>
          </div>
        </Link>

        <Link href={`/admin/projects/${currentProjectId}/progress`} className="group">
          <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02] ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-purple-900/30 group-hover:bg-purple-800/40' : 'bg-purple-100 group-hover:bg-purple-200'}`}>
                <FaChartLine className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-base md:text-lg font-semibold ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📊 Progreso
              </h3>
            </div>
            <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Visualiza el progreso y las métricas del proyecto
            </p>
            <div className={`mt-4 text-xs font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
              Análisis en tiempo real
            </div>
          </div>
        </Link>        {isOwner ? (
          <Link href={`/admin/projects/${currentProjectId}/settings`} className="group md:col-span-2 xl:col-span-1">
            <div className={`rounded-xl p-4 md:p-6 shadow-lg border transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02] ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border-gray-300'}`}>
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-red-900/30 group-hover:bg-red-800/40' : 'bg-red-100 group-hover:bg-red-200'}`}>
                  <FaProjectDiagram className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h3 className={`text-base md:text-lg font-semibold ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ⚙️ Configuración
                </h3>
              </div>
              <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configura los ajustes del proyecto
              </p>
              <div className={`mt-4 text-xs font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                👑 Solo propietarios
              </div>
            </div>
          </Link>
        ) : (
          <div className={`rounded-xl p-4 md:p-6 border opacity-60 md:col-span-2 xl:col-span-1 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <FaLock className={`text-xl md:text-2xl ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-base md:text-lg font-semibold ml-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                🔒 Configuración
              </h3>
            </div>
            <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Solo disponible para propietarios del proyecto
            </p>
            <div className={`mt-4 text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
              Acceso restringido
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
