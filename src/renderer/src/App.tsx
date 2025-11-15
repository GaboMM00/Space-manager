/**
 * Componente principal de la aplicación
 */

import { useState, useEffect } from 'react';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verificar que la API de Electron esté disponible
    if (window.electronAPI) {
      console.log('Electron API is available');
      setIsReady(true);
    } else {
      console.error('Electron API is not available');
    }
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Loading Space Manager...</h1>
          <p className="text-gray-400">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold">Space Manager</h1>
        <p className="text-gray-400 text-sm">Sistema modular de gestión de espacios de trabajo</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Welcome Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Bienvenido a Space Manager</h2>
            <p className="text-gray-400 mb-4">
              La aplicación ha sido refactorizada exitosamente según la documentación del proyecto.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-1">Estructura Modular</h3>
                <p className="text-sm text-gray-400">
                  Arquitectura limpia y escalable
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-1">TypeScript + React</h3>
                <p className="text-sm text-gray-400">
                  Type-safe development
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-1">Electron + Vite</h3>
                <p className="text-sm text-gray-400">
                  Fast builds & hot reload
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-1">SQLite + JSON</h3>
                <p className="text-sm text-gray-400">
                  Sistema híbrido de persistencia
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Próximos Pasos</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Estructura de carpetas reorganizada</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Tipos compartidos definidos</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Servicios base implementados</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">→</span>
                <span>Implementar módulos (Workspace, Tasks, Analytics)</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">→</span>
                <span>Crear UI components</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">→</span>
                <span>Implementar motor de ejecución</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
