"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { aiConversationApi, AIConversation } from "@/app/api/ai-conversation.api";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/contexts/ThemeContext";
import { 
  FaRobot, 
  FaUser, 
  FaPaperPlane, 
  FaPlus, 
  FaTrash,  
  FaCopy, 
  FaDownload,
  FaSpinner,
  FaBars,
  FaTimes,
  FaComments,
  FaBrain,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export default function AIConversationPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantsNewConversation, setWantsNewConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const data = await aiConversationApi.getAllConversations();
      setConversations(data);
      
      // Only set active conversation if user doesn't want a new conversation
      if (data.length > 0 && !activeConversation && !wantsNewConversation) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError("Error al cargar las conversaciones");
    } finally {
      setLoadingConversations(false);
    }
  }, [activeConversation, wantsNewConversation]);
  useEffect(() => {
    if (user) {
      // Test backend connection first
      testBackendConnection();
      loadConversations();
    }
  }, [user, loadConversations]);

  const testBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const result = await aiConversationApi.testConnection();
      console.log('✅ Backend connection successful:', result);
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setError('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    const messageContent = input;
    setInput("");

    console.log("Sending message:", messageContent);
    console.log("Active conversation ID:", activeConversation?.id);

    try {
      const result = await aiConversationApi.sendMessage(
        messageContent, 
        activeConversation?.id
      );      console.log("Received result:", result);

      setActiveConversation(result.conversation);
      setWantsNewConversation(false); // Reset the flag when conversation is created
      
      // Update conversations list
      const updatedConversations = conversations.map(conv => 
        conv.id === result.conversation.id ? result.conversation : conv
      );
      
      // If this is a new conversation, add it to the list
      if (!conversations.find(conv => conv.id === result.conversation.id)) {
        updatedConversations.unshift(result.conversation);
      }
      
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Error al enviar el mensaje");
      // Restore input if there's an error
      setInput(messageContent);
    } finally {
      setLoading(false);
    }
  };  const startNewConversation = () => {
    console.log("Starting new conversation - clearing active conversation");
    setActiveConversation(null);
    setWantsNewConversation(true);
    setSidebarOpen(false);
    setError(null);
    setInput("");
    
    // Force a re-render to show the welcome screen
    setTimeout(() => {
      console.log("New conversation state set, activeConversation:", null);
    }, 100);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await aiConversationApi.deleteConversation(conversationId);
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      setConversations(updatedConversations);
      
      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConversations.length > 0 ? updatedConversations[0] : null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setError("Error al eliminar la conversación");
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const exportConversation = () => {
    if (!activeConversation) return;
    
    const content = activeConversation.messages.map(msg => 
      `${msg.role === 'user' ? 'Usuario' : 'IA'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion_${activeConversation.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#212121] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 ${theme === 'dark' ? 'bg-[#181818] border-gray-700' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">          {/* Sidebar Header */}          
          <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-xl">
                <FaBrain className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Xurp IA</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Asistente Inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              >
                {theme === 'dark' ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`lg:hidden ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>{/* New Conversation Button */}
          <div className="p-4">            <button
              onClick={startNewConversation}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <FaPlus className="w-4 h-4" />
              Nueva Conversación
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4">            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-green-400 w-6 h-6" />
                <span className={`ml-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cargando...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <FaComments className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No hay conversaciones</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Inicia una nueva conversación</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}                    onClick={() => {
                      setActiveConversation(conversation);
                      setWantsNewConversation(false); // Reset when selecting existing conversation
                      setSidebarOpen(false);
                    }}                    className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeConversation?.id === conversation.id
                        ? 'bg-green-500/20 border border-green-400/50'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {conversation.title}
                        </h3>
                        <p className={`text-xs mt-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {conversation.lastMessage}
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatDate(conversation.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 ${theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>          {/* User Info */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-2 rounded-full">
                <FaUser className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-0">        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-[#181818] border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 pr-60`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FaBars className="w-5 h-5" />
              </button>              <div className="flex items-center gap-3">
                <HiSparkles className="w-6 h-6 text-green-400" />                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {activeConversation ? activeConversation.title : 'Nueva Conversación'}
                </h2>
                {!activeConversation && (
                  <span className="ml-2 px-2 py-1 bg-green-500 text-black text-xs rounded-full">
                    NUEVA
                  </span>
                )}
              </div>
            </div>
            {activeConversation && (
              <div className="flex items-center gap-2">                <button
                  onClick={exportConversation}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                  title="Exportar conversación"
                >
                  <FaDownload className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">              <div className="text-center max-w-md">
                <div className="bg-gradient-to-r from-green-400 to-green-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FaRobot className="w-10 h-10 text-black" />
                </div>                <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>¡Hola! Soy Xurp IA</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tu asistente inteligente para gestión de proyectos. Puedo ayudarte con:
                </p>                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className="text-green-400 font-medium">💡 Planificación</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Organizar tareas y cronogramas</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className="text-green-500 font-medium">🚀 Desarrollo</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Consejos de programación</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className="text-green-400 font-medium">👥 Colaboración</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Gestión de equipos</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <div className="text-green-500 font-medium">📊 Análisis</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Métricas y reportes</div>
                  </div>
                </div>
                <p className={`mt-6 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  ¿En qué puedo ayudarte hoy?
                </p>
              </div>
            </div>
          ) : (
            activeConversation.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                  {/* Avatar */}                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-green-400 to-green-500' 
                      : 'bg-gradient-to-r from-gray-800 to-black'
                  }`}>
                    {message.role === 'user' ? 
                      <FaUser className="w-5 h-5 text-black" /> : 
                      <FaRobot className="w-5 h-5 text-green-400" />
                    }
                  </div>

                  {/* Message Content */}
                  <div className={`group relative ${message.role === 'user' ? 'mr-3' : 'ml-3'}`}>                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? theme === 'dark' ? 'bg-[#4c4c4c] text-white' : 'bg-blue-500 text-white'
                        : theme === 'dark' ? 'bg-[#242625] text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                    
                    {/* Message Actions */}                    <div className={`flex items-center gap-2 mt-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      <button
                        onClick={() => copyMessage(message.content)}
                        className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Copiar mensaje"
                      >
                        <FaCopy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (            <div className="flex justify-start">
              <div className="max-w-3xl flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center">
                  <FaRobot className="w-5 h-5 text-green-400" />
                </div>                <div className={`ml-3 border px-4 py-3 rounded-2xl ${theme === 'dark' ? 'bg-black border-green-500/30' : 'bg-white border-green-300'}`}>
                  <div className="flex items-center gap-2">
                    <FaSpinner className="animate-spin w-4 h-4 text-green-400" />
                    <span className="text-green-400">Escribiendo...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>        {/* Error Message */}
        {error && (
          <div className={`mx-6 mb-4 rounded-xl p-4 ${theme === 'dark' ? 'bg-red-500/20 border-red-500/50' : 'bg-red-50 border-red-200'} border`}>
            <p className={`${theme === 'dark' ? 'text-red-200' : 'text-red-800'}`}>{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className={`border-t p-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-end gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Escribe tu mensaje aquí... (Shift + Enter para nueva línea)"
                disabled={loading}
                className={`w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent min-h-[52px] max-h-32 ${theme === 'dark' ? 'bg-[#303030] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                rows={1}
                style={{ 
                  height: 'auto',
                  minHeight: '52px',
                  maxHeight: '128px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-black p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed disabled:text-white"
            >
              {loading ? (
                <FaSpinner className="animate-spin w-5 h-5" />
              ) : (
                <FaPaperPlane className="w-5 h-5" />
              )}
            </button>
          </div>          <p className={`text-center text-xs mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Xurp IA puede cometer errores. Considera verificar información importante.
          </p>
        </div>
      </div>      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
