'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/app/hooks/useProjects';
import { useAuth } from '@/app/hooks/useAuth';
import { FaUsers, FaProjectDiagram, FaTasks, FaBrain, FaChartLine, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import { Project } from '@/app/hooks/useProjects';

interface AdminDashboardProps {
  project?: Project;
}

export default function AdminDashboard({ project: providedProject }: AdminDashboardProps) {
  const { projects } = useProjects();
  const { user } = useAuth();
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
      <div className="p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-gray-100 dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md">
            <FaProjectDiagram className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No hay proyectos disponibles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Necesitas tener al menos un proyecto para acceder al panel de administración.
            </p>
            <Link 
              href="/home/projects"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Ir a Proyectos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white">
            Panel de Administración
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Gestiona tu proyecto y colaboradores
          </p>
        </div>
        
        {/* Project selector or current project info */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 min-w-[300px]">
          <h3 className="font-semibold text-zinc-800 dark:text-white mb-2">Proyecto Actual</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{currentProject.name}</p>
          <p><strong>Propietario:</strong> {currentProject.owner?.name || 'Usuario desconocido'}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            ID: {currentProject.id}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FaProjectDiagram className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Proyectos</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <FaUsers className="text-2xl text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Colaboradores</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalCollaborators}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <FaTasks className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Tareas</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href={`/admin/projects/${currentProjectId}/collaborators`}>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaUsers className="text-2xl text-blue-600 dark:text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">Colaboradores</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Gestiona los miembros del equipo y sus permisos
            </p>
          </div>
        </Link>

        <Link href={`/admin/projects/${currentProjectId}/tasks`}>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaTasks className="text-2xl text-green-600 dark:text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">Tareas</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Administra las tareas y el progreso del proyecto
            </p>
          </div>
        </Link>

        <Link href={`/admin/projects/${currentProjectId}/progress`}>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaChartLine className="text-2xl text-purple-600 dark:text-purple-400 mr-3" />
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">Progreso</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Visualiza el progreso y las métricas del proyecto
            </p>
          </div>
        </Link>

        <Link href={`/admin/projects/${currentProjectId}/evaluations`}>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaBrain className="text-2xl text-orange-600 dark:text-orange-400 mr-3" />
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">Evaluaciones</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Evalúa las habilidades de los colaboradores
            </p>
          </div>
        </Link>

        {isOwner ? (
          <Link href={`/admin/projects/${currentProjectId}/settings`}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <FaProjectDiagram className="text-2xl text-red-600 dark:text-red-400 mr-3" />
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">Configuración</h3>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Configura los ajustes del proyecto
              </p>
            </div>
          </Link>
        ) : (
          <div className="bg-gray-100 dark:bg-zinc-900/50 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 opacity-60">
            <div className="flex items-center mb-4">
              <FaLock className="text-2xl text-gray-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-500">Configuración</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Solo disponible para propietarios del proyecto
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
