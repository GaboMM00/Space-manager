# 📦 Gestor de Espacios - Ecosistema Modular de Productividad

Bienvenido al repositorio del proyecto **Gestor de Espacios**, una aplicación modular construida con **Electron + Vite + React + TailwindCSS** y preparada para escalar con múltiples módulos (como tareas, analytics, plugins, etc). Esta app permite crear "espacios de trabajo" personalizados que encapsulan herramientas, aplicaciones y páginas necesarias para cada actividad.

---

## 🚀 Tecnologías principales

| Tecnología    | Rol                                     |
| ------------- | --------------------------------------- |
| Electron      | Aplicación de escritorio (runtime)      |
| React         | Interfaz de usuario (frontend)          |
| Vite          | Bundler de frontend                     |
| TailwindCSS   | Estilado de componentes                 |
| TypeScript    | Lenguaje principal (frontend y backend) |
| electron-vite | Integración optimizada Vite + Electron  |

---

## 🧱 Estructura de Carpetas

```plaintext
project-root/
├── dist/                     # Archivos compilados (tsc)
├── node_modules/             # Dependencias
├── src/
│   ├── main/                 # Código principal de Electron (ventanas, procesos)
│   │   └── main.ts
│   ├── preload/              # Comunicación segura entre main y renderer
│   │   └── preload.ts
│   ├── renderer/             # Frontend (React + Tailwind)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.html        # Entrada principal para Electron-Vite
│   │   ├── index.css         # TailwindCSS base
│   │   └── modules-ui/       # Interfaces específicas por módulo
│   └── modules/              # Lógica funcional de los módulos (sin UI)
│       ├── workspace/        # Lógica del módulo principal
│       ├── tasks/            # Checklists y recordatorios
│       ├── analytics/        # Métricas y seguimiento de uso
│       └── ...
├── public/                  # Recursos estáticos opcionales
├── electron.vite.config.ts  # Configuración principal de Electron + Vite
├── tailwind.config.js       # Configuración de TailwindCSS
├── postcss.config.js        # Configuración de PostCSS
├── tsconfig.json            # Configuración de TypeScript para main/preload
├── package.json             # Dependencias y scripts
└── README.md
```

---

## 📦 Scripts disponibles

```bash
# 🔄 Inicia la app en modo desarrollo
npx electron-vite dev

# ⚙️ Compila todo el código para producción
npx electron-vite build

# 🧪 Ejecuta solo el frontend React (útil para UI testing)
npx vite --root src/renderer
```
---

## 🛠 Instalación y primeros pasos

Sigue estos pasos para iniciar el proyecto en tu entorno local:

### 1. Clona el repositorio (si aplica)

```bash
git clone https://github.com/tu-usuario/space-manager.git
cd space-manager

---



## 🧠 ¿Cómo trabajar en el proyecto?

### 🔹 Desarrollo Frontend (UI)

* Trabaja en `src/renderer/`
* Usa `App.tsx`, crea componentes dentro de `modules-ui/`
* Usa `TailwindCSS` para estilos rápidos y consistentes
* Puedes usar hooks como `useState`, `useEffect`, etc.

### 🔹 Desarrollo Backend (Lógica de app)

* Trabaja en `src/modules/` para lógica por módulo
* Trabaja en `src/main/` para control de ventanas y eventos
* Usa `ipcMain` ↔ `ipcRenderer` para comunicación

### 🔹 Comunicación segura UI ↔ backend

* Define funciones en `preload.ts` usando `contextBridge`
* Accede a ellas desde React vía `window.electronAPI`

### 🔹 Plugins o scripts externos

* Se colocan en una futura carpeta `plugins/`
* Pueden ejecutarse vía Node (child\_process) o IPC

---

## ✅ Módulos esperados en el ecosistema

| Módulo              | Función principal                              |
| ------------------- | ---------------------------------------------- |
| Espacios de trabajo | Crea y lanza apps/páginas agrupadas            |
| Gestor de tareas    | Checklists por espacio + recordatorios         |
| Analytics           | Métricas de uso y productividad                |
| Plugins             | Extensiones que se pueden cargar dinámicamente |
| Audio/Ambiente      | Sonidos, música o fondo relajante              |
| Automatizador       | Secuencias automáticas de tareas               |

---

## 📌 Recomendaciones de trabajo

* Mantén los módulos desacoplados (se comunican por eventos o `ipc`)
* Mantén separación entre lógica y UI
* Usa Tailwind para UI rápida y consistente
* Evita código duplicado (crear utilidades en `utils/` si es necesario)

---

## 🧑‍💻 ¿Contribuir o expandir?

Este proyecto está diseñado para escalar modularmente.
Puedes crear nuevas carpetas en `/modules/` y `/modules-ui/` para nuevos componentes.

---

## 💬 ¿Dudas o errores?

Documenta en un archivo `NOTAS.md` o abre una carpeta `/docs/` si es necesario. También puedes dejar mensajes tipo log dentro del `main.ts` o el `preload.ts` mientras desarrollas.

---

¡Ahora sí estás listo para trabajar! 💪
