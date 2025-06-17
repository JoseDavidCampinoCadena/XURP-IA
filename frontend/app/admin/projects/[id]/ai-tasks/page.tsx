'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/app/contexts/ThemeContext';
import { aiTasksApi, AITask } from '@/app/api/ai-tasks.api';
import { skillAssessmentsApi, SkillAssessment } from '@/app/api/skill-assessments.api';
import { 
  FaBrain, 
  FaRobot, 
  FaTasks, 
  FaPlay, 
  FaCheck, 
  FaClock, 
  FaUser, 
  FaChartLine,
  FaLightbulb,
  FaSpinner,
  FaExclamationTriangle,
  FaUserGraduate,
  FaUsers,
  FaCog,
  FaTrash
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

interface AITaskProgress {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  progressPercentage: number;
  skillDistribution: {
    Principiante: number;
    Intermedio: number;
    Avanzado: number;
  };
  dailyProgress: Array<{
    day: number;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }>;
}

export default function AITasksPage() {
  const { theme } = useTheme();
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null);
    // New state for skill assessments
  const [activeTab, setActiveTab] = useState<'tasks' | 'assessments'>('tasks');
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const loadAITasks = useCallback(async () => {
    try {
      setLoading(true);
      const tasks = await aiTasksApi.getByProject(projectId);
      setAiTasks(tasks);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas de IA');
      console.error('Error loading AI tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  const loadAssessments = useCallback(async () => {
    try {
      setLoadingAssessments(true);
      const projectAssessments = await skillAssessmentsApi.getProjectAssessments(projectId);
      setAssessments(projectAssessments);
    } catch (err) {
      console.error('Error loading assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadAITasks();
    }
  }, [projectId, loadAITasks]);
  useEffect(() => {
    if (projectId && activeTab === 'assessments') {
      loadAssessments();
    }
  }, [projectId, activeTab, loadAssessments]);
  
  const generateAITasks = async () => {
    try {
      setIsGenerating(true);
      await aiTasksApi.generateForProject(projectId);
      await loadAITasks();
    } catch (err) {
      setError('Error al generar tareas de IA');
      console.error('Error generating AI tasks:', err);
    } finally {
      setIsGenerating(false);
    }
  };  const startTask = async (taskId: number) => {
    try {
      const result = await aiTasksApi.start(taskId);
      await loadAITasks();
      
      // Show success message with details
      if (result.message) {
        alert(`✅ ${result.message}
        
📅 Fecha límite estimada: ${result.estimatedDelivery}

La tarea ahora aparece en tu lista personal de tareas (/home/tasks) donde puedes hacer seguimiento de tu progreso.`);
      } else {
        alert('Tarea iniciada exitosamente. Revisa tu lista personal de tareas para hacer seguimiento.');
      }    } catch (err: unknown) {
      console.error('Error starting task:', err);
      
      // Show specific error messages
      let errorMessage = 'Error al iniciar la tarea.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        
        if (axiosError.response?.status === 500) {
          const errorText = axiosError.response?.data?.message || axiosError.message || '';
          
          if (errorText.includes('Task not found')) {
            errorMessage = 'La tarea no fue encontrada. Puede que haya sido eliminada.';
          } else if (errorText.includes('not assigned to user')) {
            errorMessage = 'Esta tarea no está asignada a ti. Solo puedes iniciar tareas que te han sido asignadas.';
          } else if (errorText.includes('permission')) {
            errorMessage = 'No tienes permisos para iniciar esta tarea.';
          } else if (errorText.includes('assigned to another user')) {
            errorMessage = 'Esta tarea está asignada a otro usuario.';
          } else {
            errorMessage = `Error del servidor: ${errorText}`;
          }
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (axiosError.response?.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        }
      }
      
      alert(`❌ ${errorMessage}\n\nSi el problema persiste, contacta al administrador del proyecto.`);
    }
  };
  const completeTask = async (taskId: number) => {
    try {
      const result = await aiTasksApi.complete(taskId);
      await loadAITasks();
      
      // Show success message
      if (result.message) {
        alert(`✅ ${result.message}`);
      } else {
        alert('Tarea completada exitosamente. Tu progreso ha sido actualizado.');
      }
    } catch (err) {
      console.error('Error completing task:', err);
      alert('Error al completar la tarea. Por favor, inténtalo de nuevo.');
    }
  };  const assignDailyTasks = async () => {
    try {
      setIsAssigning(true);
      setError(null);
      const result = await aiTasksApi.assignDailyTasks(projectId);
      
      await loadAITasks();
      
      // Show detailed assignment results
      if (result.assignments && result.assignments.length > 0) {
        const assignmentDetails = result.assignments
          .map(a => `• ${a.taskTitle} (${a.skillLevel}) → ${a.assigneeName} (Día ${a.dayNumber})`)
          .join('\n');
        
        alert(`¡Asignación inteligente completada! 🎯

${result.message}

Asignaciones realizadas:
${assignmentDetails}

Las tareas se han asignado considerando:
✓ Nivel de habilidad de cada usuario
✓ Máximo 1 tarea por usuario por día
✓ Balance de carga de trabajo
✓ Evaluaciones de competencias`);
      } else {
        alert(result.message || `Se procesaron ${result.assignedTasks} tareas.`);
      }
    } catch (err) {
      setError('Error al asignar tareas automáticamente');
      console.error('Error assigning daily tasks:', err);
      alert('Error al asignar tareas. Por favor, revisa la consola para más detalles.');
    } finally {
      setIsAssigning(false);
    }
  };
  const reassignTasksBasedOnSkills = async () => {
    try {
      setIsAssigning(true);
      setError(null);
      const result = await skillAssessmentsApi.reassignTasks(projectId);
      
      await loadAITasks();
      alert(`¡Reasignación completada! 🎯

${result.message}

Se han reasignado ${result.assignedTasks} tareas basándose en:
✓ Evaluaciones de habilidades completadas
✓ Nivel de competencia de cada colaborador
✓ Matching inteligente tarea-usuario

Las tareas aparecerán en la lista personal de cada colaborador cuando las inicien.`);
    } catch (err) {
      setError('Error al reasignar tareas basadas en habilidades');
      console.error('Error reassigning tasks:', err);
      alert('Error al reasignar tareas. Asegúrate de que hay evaluaciones completadas.');
    } finally {
      setIsAssigning(false);
    }
  };

  const resetUserAssessment = async (userId: number) => {
    try {
      await skillAssessmentsApi.resetUserAssessment(projectId, userId);
      await loadAssessments();
      alert('Evaluación reiniciada exitosamente');
    } catch (err) {
      console.error('Error resetting assessment:', err);
      alert('Error al reiniciar la evaluación');
    }
  };

  const calculateAITaskProgress = (): AITaskProgress => {
    const totalTasks = aiTasks.length;
    const completedTasks = aiTasks.filter(task => task.status === 'COMPLETED').length;
    const inProgressTasks = aiTasks.filter(task => task.status === 'IN_PROGRESS').length;
    const pendingTasks = aiTasks.filter(task => task.status === 'PENDING').length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const skillDistribution = aiTasks.reduce(
      (acc, task) => {
        acc[task.skillLevel]++;
        return acc;
      },
      { Principiante: 0, Intermedio: 0, Avanzado: 0 }
    );

    const tasksByDay = aiTasks.reduce((acc, task) => {
      if (!acc[task.dayNumber]) {
        acc[task.dayNumber] = [];
      }
      acc[task.dayNumber].push(task);
      return acc;
    }, {} as Record<number, AITask[]>);

    const dailyProgress = Object.entries(tasksByDay).map(([day, tasks]) => {
      const dayTasks = tasks.length;
      const completedDayTasks = tasks.filter(task => task.status === 'COMPLETED').length;
      return {
        day: parseInt(day),
        totalTasks: dayTasks,
        completedTasks: completedDayTasks,
        progress: dayTasks > 0 ? (completedDayTasks / dayTasks) * 100 : 0
      };
    }).sort((a, b) => a.day - b.day);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      progressPercentage,
      skillDistribution,
      dailyProgress
    };
  };

  const getFilteredTasks = () => {
    let filtered = aiTasks;
    
    if (selectedDay !== null) {
      filtered = filtered.filter(task => task.dayNumber === selectedDay);
    }
    
    if (selectedSkillLevel) {
      filtered = filtered.filter(task => task.skillLevel === selectedSkillLevel);
    }
    
    return filtered.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) {
        return a.dayNumber - b.dayNumber;
      }
      
      const statusOrder = { 'PENDING': 0, 'IN_PROGRESS': 1, 'COMPLETED': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel) {
      case 'Principiante': return 'bg-green-500';
      case 'Intermedio': return 'bg-yellow-500';
      case 'Avanzado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <FaClock className="text-yellow-400" />;
      case 'IN_PROGRESS': return <FaPlay className="text-blue-400" />;
      case 'COMPLETED': return <FaCheck className="text-green-400" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completada';
      default: return 'Desconocido';
    }
  };  if (loading && activeTab === 'tasks') {
    return (
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-[#18181b]' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-[#26D07C] w-8 h-8" />
          <span className={`ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cargando tareas de IA...</span>
        </div>
      </div>
    );
  }

  const taskProgress = calculateAITaskProgress();
  const filteredTasks = getFilteredTasks();  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-[#18181b]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-12">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
              <FaBrain className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Gestión Inteligente</h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tareas IA y Evaluaciones de Habilidad</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            {activeTab === 'tasks' && aiTasks.length === 0 && (
              <button
                onClick={generateAITasks}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FaRobot className="w-5 h-5" />
                    Generar Tareas IA
                  </>
                )}
              </button>
            )}
            
            {activeTab === 'tasks' && aiTasks.length > 0 && assessments.length > 0 && (
              <button
                onClick={reassignTasksBasedOnSkills}
                disabled={isAssigning}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
              >
                {isAssigning ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Reasignando...
                  </>
                ) : (
                  <>
                    <FaBrain className="w-5 h-5" />
                    Reasignar por Habilidades
                  </>
                )}
              </button>
            )}
          </div>
        </div>        {/* Tabs Navigation */}
        <div className={`rounded-2xl p-2 mb-8 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'}`}>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaTasks className="w-5 h-5" />
              Gestión de Tareas
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'assessments'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                  : theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaUserGraduate className="w-5 h-5" />
              Evaluaciones de Habilidad
              {assessments.length > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {assessments.length}
                </span>
              )}
            </button>
          </div>
        </div>        {error && (
          <div className={`border rounded-xl p-4 mb-6 flex items-center gap-3 ${
            theme === 'dark' 
              ? 'bg-red-500/20 border-red-500/50' 
              : 'bg-red-50 border-red-200'
          }`}>
            <FaExclamationTriangle className="text-red-400 w-5 h-5" />
            <span className={`${theme === 'dark' ? 'text-red-200' : 'text-red-800'}`}>{error}</span>
          </div>
        )}        {/* Smart Assignment Info */}
        {activeTab === 'tasks' && aiTasks.length > 0 && (
          <div className={`border rounded-2xl p-6 mb-8 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <FaBrain className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  🎯 Sistema de Asignación Inteligente
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                  Nuestro sistema asigna tareas automáticamente considerando múltiples factores para optimizar el rendimiento del equipo.
                </p>                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className={`font-semibold flex items-center gap-2 ${
                      theme === 'dark' ? 'text-blue-100' : 'text-blue-800'
                    }`}>
                      <FaUserGraduate className="w-4 h-4" />
                      Factores de Asignación:
                    </h4>
                    <ul className={`text-sm space-y-1 ml-6 ${
                      theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                    }`}>
                      <li>• Evaluaciones de competencias completadas</li>
                      <li>• Matching exacto de nivel de habilidad</li>
                      <li>• Experiencia en tecnologías específicas</li>
                      <li>• Carga de trabajo actual y balance</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className={`font-semibold flex items-center gap-2 ${
                      theme === 'dark' ? 'text-blue-100' : 'text-blue-800'
                    }`}>
                      <FaClock className="w-4 h-4" />
                      Límites Inteligentes:
                    </h4>                    <ul className={`text-sm space-y-1 ml-6 ${
                      theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                    }`}>
                      <li>• Balance personalizado por nivel de habilidad</li>
                      <li>• Límites diarios adaptativos (1-3 tareas)</li>
                      <li>• Balance automático optimizado</li>
                      <li>• Distribución progresiva inteligente</li>
                    </ul>
                  </div>
                </div>                <div className={`mt-4 p-4 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 border-blue-500/30' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ⚖️ Nuevo Sistema de Balance de Carga
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="font-semibold text-green-400">🟢 Principiante</div>
                        <div className="text-xs">3 tareas/día</div>
                        <div className="text-xs opacity-75">Más práctica</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-yellow-400">🟡 Intermedio</div>
                        <div className="text-xs">2 tareas/día</div>
                        <div className="text-xs opacity-75">Balance óptimo</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-red-400">🔴 Avanzado</div>
                        <div className="text-xs">1 tarea/día</div>
                        <div className="text-xs opacity-75">Alta complejidad</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`mt-4 p-4 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-yellow-500/20 border-yellow-500/30' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className={`flex items-start gap-2 text-sm ${
                    theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
                  }`}>
                    <FaExclamationTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Importante:</strong> Para una asignación óptima, asegúrate de que los colaboradores hayan completado sus evaluaciones de habilidades. 
                      <br />Usuarios sin evaluaciones recibirán tareas básicas por defecto.
                    </div>
                  </div>
                </div>
                <div className={`mt-4 p-4 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className={`flex items-center gap-2 text-sm ${
                    theme === 'dark' ? 'text-green-200' : 'text-green-800'
                  }`}>
                    <FaCheck className="w-4 h-4" />
                    <strong>Nuevo:</strong> Las tareas sin asignar se asignan automáticamente al usuario que las inicia
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'tasks' ? (
          // Tasks Tab Content
          <>            {aiTasks.length === 0 ? (
              <div className={`rounded-2xl p-12 text-center ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
              }`}>
                <FaRobot className={`w-16 h-16 mx-auto mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h2 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>No hay tareas de IA generadas</h2>
                <p className={`mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Genera tareas automáticamente basadas en el análisis de IA de tu proyecto
                </p>
                <button
                  onClick={generateAITasks}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="animate-spin w-6 h-6" />
                      Generando Tareas...
                    </>
                  ) : (
                    <>
                      <HiSparkles className="w-6 h-6" />
                      Generar Tareas con IA
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Progress Overview */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className={`rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <FaTasks className="text-blue-400 w-8 h-8" />
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{taskProgress.totalTasks}</span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Tareas</p>
                  </div>
                  
                  <div className={`rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <FaCheck className="text-[#26D07C] w-8 h-8" />
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{taskProgress.completedTasks}</span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Completadas</p>
                  </div>
                  
                  <div className={`rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <FaPlay className="text-blue-400 w-8 h-8" />
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{taskProgress.inProgressTasks}</span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>En Progreso</p>
                  </div>
                  
                  <div className={`rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <FaChartLine className="text-purple-400 w-8 h-8" />
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{Math.round(taskProgress.progressPercentage)}%</span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Progreso</p>
                  </div>
                </div>                {/* Filters */}
                <div className={`rounded-2xl p-6 mb-8 ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaLightbulb className="text-yellow-400" />
                    Filtros
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Day Filter */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Por Día</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedDay(null)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedDay === null 
                              ? 'bg-blue-600 text-white' 
                              : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Todos
                        </button>
                        {taskProgress.dailyProgress.map(day => (
                          <button
                            key={day.day}
                            onClick={() => setSelectedDay(day.day)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              selectedDay === day.day 
                                ? 'bg-blue-600 text-white' 
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Día {day.day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skill Level Filter */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Por Nivel</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedSkillLevel(null)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedSkillLevel === null 
                              ? 'bg-purple-600 text-white' 
                              : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Todos
                        </button>
                        {Object.entries(taskProgress.skillDistribution).map(([level, count]) => (
                          <button
                            key={level}
                            onClick={() => setSelectedSkillLevel(level)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                              selectedSkillLevel === level 
                                ? 'bg-purple-600 text-white' 
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(level)}`}></div>
                            {level} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>                {/* Tasks List */}
                <div className={`rounded-2xl p-6 ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold flex items-center gap-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <FaTasks className="text-[#26D07C]" />
                      Tareas ({filteredTasks.length})
                    </h3>                    {aiTasks.some(task => !task.assignee) && (
                      <div className="flex gap-2">
                        <div className="relative group">
                          <button
                            onClick={assignDailyTasks}
                            disabled={isAssigning}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 text-sm"
                          >
                            {isAssigning ? (
                              <>
                                <FaSpinner className="animate-spin w-4 h-4" />
                                Asignando...
                              </>
                            ) : (
                              <>
                                <FaUser className="w-4 h-4" />
                                Asignación Inteligente
                              </>
                            )}
                          </button>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className={`text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-900 text-white border-gray-600' 
                                : 'bg-white text-gray-900 border-gray-200'
                            }`}>                              <div className="text-center">
                                <p className="font-semibold mb-1">🎯 Asignación Inteligente</p>
                                <p>✓ Considera evaluaciones de habilidades</p>
                                <p>✓ Balance de carga personalizado:</p>
                                <p className="text-xs">• Avanzado: 1 tarea/día</p>
                                <p className="text-xs">• Intermedio: 2 tareas/día</p>
                                <p className="text-xs">• Principiante: 3 tareas/día</p>
                                <p>✓ Prioriza colaboradores calificados</p>
                              </div>
                              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                theme === 'dark' ? 'border-t-gray-900' : 'border-t-white'
                              }`}></div>
                            </div>
                          </div>
                        </div>

                        <div className="relative group">
                          <button
                            onClick={reassignTasksBasedOnSkills}
                            disabled={isAssigning}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 text-sm"
                          >
                            {isAssigning ? (
                              <>
                                <FaSpinner className="animate-spin w-4 h-4" />
                                Reasignando...
                              </>
                            ) : (
                              <>
                                <FaUserGraduate className="w-4 h-4" />
                                Por Evaluaciones
                              </>
                            )}
                          </button>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className={`text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-900 text-white border-gray-600' 
                                : 'bg-white text-gray-900 border-gray-200'
                            }`}>
                              <div className="text-center">
                                <p className="font-semibold mb-1">🎓 Asignación por Evaluaciones</p>
                                <p>✓ Solo usuarios con test completado</p>
                                <p>✓ Matching exacto de nivel de habilidad</p>
                                <p>✓ Requiere evaluaciones completadas</p>
                              </div>
                              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                theme === 'dark' ? 'border-t-gray-900' : 'border-t-white'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <FaTasks className={`w-12 h-12 mx-auto mb-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <p className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>No hay tareas que coincidan con los filtros seleccionados</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-xl p-6 border transition-all duration-300 ${
                            theme === 'dark' 
                              ? 'bg-gray-700/50 border-gray-600/50 hover:border-[#26D07C]/30' 
                              : 'bg-gray-50 border-gray-200 hover:border-[#26D07C]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  Día {task.dayNumber}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(task.skillLevel)}`}></div>
                                <span className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>{task.skillLevel}</span>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(task.status)}
                                  <span className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                  }`}>{getStatusText(task.status)}</span>
                                </div>
                              </div>
                              
                              <h4 className={`text-lg font-semibold mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>{task.title}</h4>
                              <p className={`mb-3 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>{task.description}</p>
                                <div className={`flex items-center gap-4 text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <FaClock />
                                  <span>Estimado: {task.estimatedHours}h</span>
                                </div>                                {task.assignee ? (
                                  <div className="flex items-center gap-2">
                                    <FaUser />
                                    <span>Asignado: {task.assignee.name}</span>
                                    {/* TODO: Add evaluation status indicator when available in task data */}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-yellow-500">
                                    <FaUser />
                                    <span>Sin asignar</span>
                                  </div>
                                )}
                              </div>
                            </div>
                              <div className="flex gap-2 ml-4">
                              {task.status === 'PENDING' && (
                                <div className="flex flex-col items-end gap-2">
                                  {!task.assignee && (
                                    <span className="text-xs text-yellow-600 px-2 py-1 bg-yellow-400/20 rounded-full">
                                      Se asignará automáticamente
                                    </span>
                                  )}
                                  <button
                                    onClick={() => startTask(task.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                                    title={!task.assignee ? "Esta tarea se te asignará automáticamente al iniciarla" : "Iniciar tarea asignada"}
                                  >
                                    <FaPlay className="w-4 h-4" />
                                    Iniciar
                                  </button>
                                </div>
                              )}
                              
                              {task.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => completeTask(task.id)}
                                  className="bg-[#26D07C] hover:bg-[#20B569] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                                >
                                  <FaCheck className="w-4 h-4" />
                                  Completar
                                </button>
                              )}
                              
                              {task.status === 'COMPLETED' && (
                                <span className="text-[#26D07C] px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                                  <FaCheck className="w-4 h-4" />
                                  Completada
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress bar for the task */}
                          <div className={`w-full rounded-full h-2 ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                task.status === 'COMPLETED' ? 'bg-[#26D07C]' : 
                                task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
                              }`}
                              style={{ 
                                width: task.status === 'COMPLETED' ? '100%' : 
                                       task.status === 'IN_PROGRESS' ? '50%' : '0%' 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>        ) : (
          // Assessments Tab Content
          <div className="space-y-8">
            {loadingAssessments ? (
              <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-[#26D07C] w-8 h-8" />
                <span className={`ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cargando evaluaciones...</span>
              </div>
            ) : (
              <>
                {/* Assessment Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className={`rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <FaUsers className="text-blue-400 w-8 h-8" />
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{assessments.length}</span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Evaluaciones Completadas</p>
                  </div>
                  
                  <div className={`rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <FaUserGraduate className="text-[#26D07C] w-8 h-8" />
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {assessments.filter(a => a.skillLevel === 'Avanzado').length}
                      </span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Nivel Avanzado</p>
                  </div>
                  
                  <div className={`rounded-2xl p-6 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <FaChartLine className="text-purple-400 w-8 h-8" />
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {assessments.length > 0 
                          ? Math.round(assessments.reduce((acc, a) => acc + a.score, 0) / assessments.length)
                          : 0}%
                      </span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Puntuación Promedio</p>
                  </div>
                </div>                {/* Assessments List */}
                <div className={`rounded-2xl p-6 ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold flex items-center gap-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <FaUserGraduate className="text-[#26D07C]" />
                      Evaluaciones de Colaboradores
                    </h3>
                  </div>                  {assessments.length === 0 ? (
                    <div className="text-center py-12">
                      <FaUserGraduate className={`w-12 h-12 mx-auto mb-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>No hay evaluaciones completadas</h3>
                      <p className={`mb-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Los colaboradores pueden completar una evaluación de habilidades cuando se unan al proyecto
                      </p>
                      
                      {/* Warning about task assignment */}
                      <div className={`mt-6 p-4 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-yellow-500/20 border-yellow-500/30' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className={`flex items-start gap-3 text-sm ${
                          theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
                        }`}>
                          <FaExclamationTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-semibold mb-2">⚠️ Impacto en la Asignación de Tareas</p>
                            <ul className="space-y-1">
                              <li>• Sin evaluaciones, las tareas se asignan de forma básica</li>
                              <li>• Los colaboradores sin test reciben menor prioridad</li>
                              <li>• Tareas avanzadas pueden asignarse a usuarios principiantes</li>
                              <li>• Recomendamos que todos completen sus evaluaciones</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`mt-4 border rounded-xl p-4 ${
                        theme === 'dark' 
                          ? 'bg-blue-500/20 border-blue-500/50' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-blue-200' : 'text-blue-800'                        }`}>
                          💡 Los colaboradores pueden acceder a su evaluación desde la página de skill-assessment del proyecto
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className={`rounded-xl p-6 border transition-all duration-300 ${
                            theme === 'dark' 
                              ? 'bg-gray-700/50 border-gray-600/50 hover:border-[#26D07C]/30' 
                              : 'bg-gray-50 border-gray-200 hover:border-[#26D07C]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-r from-[#26D07C] to-teal-600 p-3 rounded-xl">
                                <FaUser className="text-white w-6 h-6" />
                              </div>
                              <div>
                                <h4 className={`text-lg font-semibold ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>{assessment.user.name}</h4>
                                <p className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>{assessment.user.email}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(assessment.skillLevel)}`}></div>
                                  <span className={`text-sm font-medium ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                  }`}>{assessment.skillLevel}</span>
                                  <span className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>•</span>
                                  <span className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                  }`}>{assessment.score}% de aciertos</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>{assessment.score}%</div>
                                <div className={`text-xs ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>Puntuación</div>
                              </div>
                              <button
                                onClick={() => resetUserAssessment(assessment.userId)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm"
                                title="Reiniciar evaluación"
                              >
                                <FaTrash className="w-3 h-3" />
                                Reiniciar
                              </button>
                            </div>
                          </div>
                          
                          <div className={`mt-4 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Completada el {new Date(assessment.completedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>                {/* Information Card */}
                <div className={`border rounded-xl p-6 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50' 
                    : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <FaCog className="text-purple-400 w-6 h-6 mt-1" />
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>¿Cómo funciona el sistema de evaluaciones?</h3>
                      <ul className={`text-sm space-y-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <li>• Los colaboradores completan una evaluación al unirse al proyecto</li>
                        <li>• El sistema determina automáticamente su nivel: Principiante, Intermedio o Avanzado</li>
                        <li>• Las tareas se asignan automáticamente basándose en el nivel de habilidad</li>
                        <li>• Puedes reasignar tareas cuando se completen nuevas evaluaciones</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
