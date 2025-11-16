# Requisitos del Sistema - Space Manager

Este documento detalla los requisitos y versiones necesarias para desarrollar y ejecutar Space Manager.

## 📋 Índice
- [Software Requerido](#software-requerido)
- [Versiones Específicas](#versiones-específicas)
- [Configuración en Windows](#configuración-en-windows)
- [Configuración en macOS](#configuración-en-macos)
- [Configuración en Linux](#configuración-en-linux)
- [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Software Requerido

### Obligatorios

1. **Node.js**
   - Versión: **20.x LTS** o **22.x LTS**
   - Recomendado: 20.11.0 o superior
   - Download: https://nodejs.org/

2. **npm**
   - Versión: **10.x** o superior
   - Viene incluido con Node.js

3. **Python** (para compilar módulos nativos)
   - Versión: **3.11.x** o **3.12.x**
   - ⚠️ **IMPORTANTE**: NO usar Python 3.13+ (eliminó módulo `distutils`)
   - Download: https://www.python.org/downloads/

### Opcionales

4. **Git**
   - Versión: 2.40+ recomendado
   - Download: https://git-scm.com/

---

## 📦 Versiones Específicas de Dependencias

### Dependencias de Producción
```json
{
  "better-sqlite3": "^11.0.0",
  "uuid": "^10.0.0"
}
```

### Dependencias de Desarrollo (Principales)
```json
{
  "electron": "^33.2.1",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.7.2",
  "vite": "^6.0.5",
  "electron-vite": "^2.3.0",
  "eslint": "^9.18.0",
  "tailwindcss": "^3.4.17"
}
```

---

## 💻 Configuración en Windows

### 1. Instalar Node.js
```powershell
# Descargar e instalar desde https://nodejs.org/
# O usar nvm-windows:
nvm install 20.11.0
nvm use 20.11.0
```

### 2. Instalar Python
```powershell
# Descargar Python 3.12.x desde https://www.python.org/downloads/
# Durante la instalación:
# ✅ Marcar "Add Python to PATH"
# ✅ Marcar "Install for all users"
```

### 3. Instalar Build Tools para C++ (CRÍTICO)

**Opción A - Automático (Recomendado):**
```powershell
# Ejecutar PowerShell como Administrador
npm install --global --production windows-build-tools
```

**Opción B - Manual:**
1. Descargar **Visual Studio 2022 Build Tools**
   - URL: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. Durante instalación, seleccionar:
   - ✅ "Desktop development with C++"
   - ✅ "MSVC v143 - VS 2022 C++ x64/x86 build tools"
   - ✅ "Windows SDK"

### 4. Configurar Python para node-gyp

```powershell
# Verificar versión de Python (debe ser 3.11 o 3.12)
python --version

# Configurar npm para usar Python correcto
npm config set python "C:\Path\To\Python312\python.exe"
```

### 5. Instalar Dependencias del Proyecto

```powershell
# Limpiar instalación previa (si existe)
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Instalar dependencias
npm install

# Si better-sqlite3 falla, reconstruir manualmente:
npm run rebuild
```

---

## 🍎 Configuración en macOS

### 1. Instalar Xcode Command Line Tools
```bash
xcode-select --install
```

### 2. Instalar Homebrew (si no está instalado)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 3. Instalar Node.js y Python
```bash
# Instalar Node.js LTS
brew install node@20

# Instalar Python 3.12
brew install python@3.12

# Verificar versiones
node -v  # Debe ser v20.x.x
python3 --version  # Debe ser 3.12.x
```

### 4. Instalar Dependencias del Proyecto
```bash
# Limpiar instalación previa
rm -rf node_modules package-lock.json

# Instalar
npm install

# Reconstruir si es necesario
npm run rebuild
```

---

## 🐧 Configuración en Linux (Ubuntu/Debian)

### 1. Instalar Build Essentials
```bash
sudo apt update
sudo apt install -y build-essential git curl
```

### 2. Instalar Node.js
```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node -v
npm -v
```

### 3. Instalar Python y Dependencias
```bash
sudo apt install -y python3.12 python3.12-dev python3-pip
```

### 4. Instalar Dependencias del Proyecto
```bash
# Limpiar
rm -rf node_modules package-lock.json

# Instalar
npm install

# Reconstruir si es necesario
npm run rebuild
```

---

## 🔍 Solución de Problemas

### Error: "NODE_MODULE_VERSION mismatch"

**Causa**: Módulo nativo compilado para versión incorrecta de Node/Electron

**Solución**:
```bash
npm run rebuild
```

### Error: "Could not find any Visual Studio installation" (Windows)

**Causa**: Faltan Build Tools de C++

**Solución**: Ver sección "Configuración en Windows" paso 3

### Error: "ModuleNotFoundError: No module named 'distutils'"

**Causa**: Python 3.13+ no tiene distutils

**Solución**:
```bash
# Desinstalar Python 3.13
# Instalar Python 3.12.x desde https://www.python.org/downloads/
# Configurar npm:
npm config set python "C:\Path\To\Python312\python.exe"
```

### Error: "gyp ERR! stack Error: spawn ENOENT"

**Causa**: Python no está en PATH

**Solución**:
```bash
# Windows
npm config set python "C:\Python312\python.exe"

# macOS/Linux
npm config set python /usr/bin/python3.12
```

### Error: Dependencias deprecadas durante npm install

**Causa**: Advertencias normales de subdependencias

**Solución**: Las advertencias son normales y no afectan la funcionalidad. Solo son avisos de que algunas librerías internas de otras dependencias están obsoletas.

### Error al compilar better-sqlite3

**Opción 1 - Usar binarios precompilados**:
```bash
npm uninstall better-sqlite3
npm install better-sqlite3 --build-from-source=false
```

**Opción 2 - Compilar con configuración explícita**:
```bash
npm config set python /path/to/python3.12
npm rebuild better-sqlite3 --build-from-source
```

---

## ✅ Verificación de Instalación

Después de instalar todas las dependencias, ejecutar:

```bash
# Verificar que todo compile
npm run typecheck

# Verificar ESLint
npm run lint

# Ejecutar en modo desarrollo
npm run dev
```

Si todo funciona correctamente, deberías ver:
```
✓ build the electron main process successfully
✓ build the electron preload files successfully
✓ dev server running for the electron renderer process at: http://localhost:5173/
✓ start electron app...
```

---

## 📝 Resumen de Versiones Compatibles

| Software | Versión Mínima | Versión Recomendada | Versión Máxima |
|----------|----------------|---------------------|----------------|
| Node.js  | 20.11.0        | 20.11.0+           | 22.x           |
| npm      | 10.0.0         | 10.5.0+            | 11.x           |
| Python   | 3.11.0         | 3.12.x             | 3.12.x         |
| Git      | 2.30.0         | 2.40.0+            | latest         |

---

## 🆘 Soporte

Si encuentras problemas no documentados aquí:

1. Revisa los logs completos en: `C:\Users\[usuario]\AppData\Local\npm-cache\_logs\`
2. Verifica versiones: `node -v`, `npm -v`, `python --version`
3. Intenta instalación limpia:
   ```bash
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   ```

---

**Última actualización**: 2025-11-16
