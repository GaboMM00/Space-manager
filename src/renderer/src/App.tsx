import { useState } from 'react'
import { useSystemPing, useSystemInfo } from './hooks/use-ipc'

function App(): JSX.Element {
  const [count, setCount] = useState(0)
  const { ping, isPinging, latency } = useSystemPing()
  const { systemInfo, isLoading: isLoadingInfo } = useSystemInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Space Manager
          </h1>
          <p className="text-xl text-white/90">
            Sistema Modular de Gestión de Espacios de Trabajo Digitales
          </p>
          <p className="text-sm text-white/70 mt-2">
            ✅ Fase 1 Sprint 1.1 - Arquitectura MVVM Base
          </p>
        </div>

        {/* Card with Counter and IPC Test */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Count is {count}
            </button>

            {/* IPC Test - Ping Button */}
            <div className="pt-4 border-t border-white/20">
              <button
                onClick={ping}
                disabled={isPinging}
                className="bg-white/20 text-white font-semibold py-2 px-6 rounded-lg hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
              >
                {isPinging ? 'Pinging...' : 'Test IPC Ping'}
              </button>
              {latency !== null && (
                <p className="text-white/80 text-sm mt-2">
                  Latency: <span className="font-bold text-white">{latency}ms</span>
                </p>
              )}
            </div>

            <p className="text-white/80 text-sm">
              Proyecto inicializado correctamente con:
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {['Electron', 'Vite', 'React', 'TypeScript', 'Tailwind CSS'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* System Info Card */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          {isLoadingInfo ? (
            <p className="text-white/70 text-sm text-center">Loading system info...</p>
          ) : systemInfo ? (
            <div className="text-white/70 text-sm space-y-1">
              <p className="text-center mb-2">
                <span className="font-semibold text-white">System Information</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>Platform: <span className="text-white">{systemInfo.platform}</span></div>
                <div>Architecture: <span className="text-white">{systemInfo.arch}</span></div>
                <div>Electron: <span className="text-white">{systemInfo.electronVersion}</span></div>
                <div>Node.js: <span className="text-white">{systemInfo.nodeVersion}</span></div>
              </div>
            </div>
          ) : (
            <p className="text-white/70 text-sm text-center">No system info available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white transition-all duration-200 border border-white/10">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm font-medium">Espacios</div>
            <div className="text-xs text-white/60 mt-1">Sprint 1.3</div>
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white transition-all duration-200 border border-white/10">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm font-medium">Tareas</div>
            <div className="text-xs text-white/60 mt-1">Sprint 3.1</div>
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white transition-all duration-200 border border-white/10">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Analytics</div>
            <div className="text-xs text-white/60 mt-1">Sprint 3.2</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
