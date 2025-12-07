# Space Manager

Sistema Modular de Gestión de Espacios de Trabajo Digitales

## 🚀 Stack Tecnológico

- **Electron** 32+ - Framework para aplicaciones desktop
- **Vite** 5+ - Build tool ultrarrápido
- **React** 18+ - Librería UI
- **TypeScript** 5+ - Tipado estático
- **Tailwind CSS** 3+ - Framework CSS utility-first

## 📋 Prerequisitos

- Node.js 20.x (se recomienda usar nvm)
- npm o yarn

## 🛠️ Instalación

```bash
# Clonar el repositorio (cuando esté en GitHub)
git clone https://github.com/GaboMM00/Space-manager
cd Space-Manager

# Instalar dependencias
npm install
```

## 💻 Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# El comando anterior:
# - Compila el Main Process
# - Compila el Preload
# - Inicia el servidor de desarrollo del Renderer
# - Abre la aplicación Electron con Hot Reload
```

## 🏗️ Build

```bash
# Build para desarrollo (más rápido, sin optimizaciones)
npm run build

# Build para producción específico por plataforma
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux

# Build sin empaquetar (para testing)
npm run build:unpack
```

## 📁 Estructura del Proyecto

```
Space-Manager/
├── docs/                       # Documentación del proyecto
│   ├── ARCHITECTURE.md         # Arquitectura general
│   ├── PROJECT_PLAN.md         # Plan maestro de desarrollo
│   ├── SQLITE_SCHEMA.sql       # Esquema de base de datos
│   └── ...                     # Más documentación
│
├── src/
│   ├── main/                   # Main Process (Electron)
│   │   └── index.ts           # Entry point principal
│   │
│   ├── preload/               # Preload scripts
│   │   └── index.ts           # API bridge
│   │
│   └── renderer/              # Renderer Process (React)
│       ├── index.html
│       └── src/
│           ├── App.tsx        # Componente raíz
│           ├── main.tsx       # Entry point
│           └── assets/        # Estilos y recursos
│
├── resources/                  # Recursos para empaquetado
├── electron.vite.config.ts    # Configuración de Vite
├── tailwind.config.js         # Configuración de Tailwind
└── package.json
```

## 🎨 Estilos con Tailwind CSS

El proyecto usa Tailwind CSS con una configuración personalizada:

### Colores Personalizados

```tsx
// Colores primarios (morado)
className="bg-primary-500 text-primary-100"

// Colores secundarios (púrpura)
className="bg-secondary-500 text-secondary-100"
```

### Clases Personalizadas

```tsx
// Botón primario
className="btn-primary"

// Card con estilo
className="card"
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Modo desarrollo con Hot Reload
npm run build        # Build de producción
npm run start        # Preview del build
npm run lint         # Ejecutar ESLint
npm run format       # Formatear código con Prettier
npm run typecheck    # Verificar tipos TypeScript
```

## 📚 Documentación

La documentación completa del proyecto está en la carpeta `/docs`:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitectura del sistema
- **[PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)** - Plan de desarrollo
- **[SRS_COMPLETE.md](./docs/SRS_COMPLETE.md)** - Especificación de requerimientos
- **[SQLITE_SCHEMA.sql](./docs/SQLITE_SCHEMA.sql)** - Esquema de base de datos
- **[SQLITE_CORRECTIONS_LOG.md](./docs/SQLITE_CORRECTIONS_LOG.md)** - Log de correcciones

## 🐛 Troubleshooting

### La aplicación no inicia

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules
npm install
```

### Hot Reload no funciona

```bash
# Reiniciar el servidor de desarrollo
# Ctrl+C para detener
npm run dev
```

### Errores de TypeScript

```bash
# Verificar tipos
npm run typecheck
```

## 📝 Notas de Desarrollo

### Variables de Entorno

El proyecto detecta automáticamente el modo de desarrollo:
- `NODE_ENV=development` - Modo desarrollo
- `NODE_ENV=production` - Modo producción

### DevTools

En modo desarrollo, DevTools se abre automáticamente. Para abrir/cerrar:
- Windows/Linux: `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

## 🤝 Contribución

Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

## 👥 Equipo

- Gabriel Medina - Arquitecto/Líder
- Ángel Pérez - Backend
- Cristian Espinoza - Frontend

## 🎯 Roadmap

Ver [PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) para el roadmap completo del proyecto.

---

**Versión:** 1.0.0
**Última actualización:** Noviembre 2025
