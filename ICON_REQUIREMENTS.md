# Icon Requirements for Space Manager

Para agregar iconos profesionales a Space Manager, necesitas crear las siguientes imágenes:

## 📁 Estructura de Carpetas

Crea esta estructura de carpetas en tu proyecto:

```
Space-Manager/
├── resources/
│   ├── icons/
│   │   ├── icon.ico          (Windows)
│   │   ├── icon.icns         (macOS)
│   │   ├── icon.png          (Linux - 512x512)
│   │   ├── 16x16.png
│   │   ├── 24x24.png
│   │   ├── 32x32.png
│   │   ├── 48x48.png
│   │   ├── 64x64.png
│   │   ├── 128x128.png
│   │   ├── 256x256.png
│   │   └── 512x512.png
│   └── installer/
│       └── background.png     (macOS DMG - 540x380)
```

## 🎨 Imágenes Requeridas

### 1. **Windows** (.ico)
**Archivo**: `resources/icons/icon.ico`
- **Formato**: ICO (archivo multi-resolución)
- **Resoluciones incluidas**: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256
- **Profundidad de color**: 32-bit con transparencia
- **Uso**: Icono de aplicación en Windows, taskbar, ventanas

### 2. **macOS** (.icns)
**Archivo**: `resources/icons/icon.icns`
- **Formato**: ICNS (archivo multi-resolución de Apple)
- **Resoluciones incluidas**: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
- **Profundidad de color**: 32-bit con transparencia
- **Uso**: Icono de aplicación en macOS, Dock, Finder

### 3. **Linux** (.png)
**Archivo**: `resources/icons/icon.png`
- **Formato**: PNG
- **Resolución**: 512x512 píxeles
- **Profundidad de color**: 32-bit con transparencia (canal alpha)
- **Uso**: Icono principal para Linux (AppImage, DEB, RPM)

### 4. **PNGs Individuales** (para generar .ico y .icns)
**Ubicación**: `resources/icons/`
- `16x16.png` - 16×16 píxeles
- `24x24.png` - 24×24 píxeles
- `32x32.png` - 32×32 píxeles
- `48x48.png` - 48×48 píxeles
- `64x64.png` - 64×64 píxeles
- `128x128.png` - 128×128 píxeles
- `256x256.png` - 256×256 píxeles
- `512x512.png` - 512×512 píxeles

**Características**:
- Formato PNG con canal alpha (transparencia)
- Fondo transparente
- Centrados y con padding adecuado

### 5. **Background del Instalador macOS** (Opcional)
**Archivo**: `resources/installer/background.png`
- **Formato**: PNG
- **Resolución**: 540×380 píxeles
- **Uso**: Fondo del instalador DMG en macOS
- **Diseño sugerido**: Logo centrado con instrucciones visuales

## 🛠️ Herramientas para Crear Iconos

### Opción 1: Herramientas Online (Más Fácil)
1. **PNG a ICO**: https://www.icoconverter.com/
   - Sube tu PNG de 512x512
   - Descarga el archivo .ico

2. **PNG a ICNS**: https://cloudconvert.com/png-to-icns
   - Sube tu PNG de 512x512 o 1024x1024
   - Convierte a .icns

3. **Redimensionar PNGs**: https://www.iloveimg.com/resize-image
   - Sube tu PNG original
   - Redimensiona a todas las resoluciones necesarias

### Opción 2: Herramientas de Escritorio
1. **ImageMagick** (línea de comandos):
   ```bash
   # Instalar
   npm install -g imagemagick

   # Crear todas las resoluciones desde un PNG grande
   convert icon-source.png -resize 16x16 16x16.png
   convert icon-source.png -resize 24x24 24x24.png
   convert icon-source.png -resize 32x32 32x32.png
   # ... etc
   ```

2. **GIMP** (gratuito):
   - Abre tu diseño original
   - Exporta en diferentes tamaños
   - Para .ico: File → Export As → selecciona .ico

3. **Adobe Photoshop**:
   - Usa plugins como ICOFormat para exportar .ico
   - Para .icns usa plugins específicos de macOS

### Opción 3: Generadores Automáticos
1. **electron-icon-builder**:
   ```bash
   npm install -g electron-icon-builder

   # Desde un PNG de 1024x1024, genera todo automáticamente
   electron-icon-builder --input=./icon.png --output=./resources/icons
   ```

2. **icon-gen**:
   ```bash
   npm install -g icon-gen

   # Genera .ico y .icns desde PNGs
   icon-gen -i ./icon-source.png -o ./resources/icons
   ```

## 📐 Diseño del Icono - Mejores Prácticas

### 1. **Diseño Base**
- Crea un diseño vectorial inicial en 1024×1024 o superior
- Usa formas simples y reconocibles
- Asegúrate de que sea legible incluso a 16×16 píxeles

### 2. **Colores**
- Usa colores vibrantes pero profesionales
- Evita gradientes muy complejos (se ven mal en tamaños pequeños)
- Asegura buen contraste con fondos claros y oscuros

### 3. **Forma**
- Los iconos cuadrados funcionan mejor
- Deja un margen/padding del 10-15% en los bordes
- Para macOS, considera el diseño con esquinas redondeadas

### 4. **Transparencia**
- SIEMPRE usa fondo transparente
- Evita bordes con anti-aliasing contra fondo blanco

### 5. **Prueba en Todos los Tamaños**
- Verifica que el icono sea reconocible en 16×16
- Asegúrate de que los detalles importantes sean visibles

## 🚀 Pasos de Implementación

### 1. Crear el diseño original
- Diseña en 1024×1024 píxeles
- Exporta como PNG con transparencia

### 2. Generar todas las resoluciones
- Usa una de las herramientas mencionadas arriba
- Genera todos los PNGs necesarios

### 3. Crear archivos específicos de plataforma
- Convierte a .ico para Windows
- Convierte a .icns para macOS
- Copia el PNG 512×512 como icon.png para Linux

### 4. Colocar en la estructura de carpetas
```bash
mkdir -p resources/icons
mkdir -p resources/installer

# Copia todos los archivos generados a resources/icons/
```

### 5. Actualizar electron-builder.yml
Los iconos se configurarán automáticamente cuando descomentes las líneas en `electron-builder.yml`

## 📝 Notas Importantes

1. **Tamaño de Archivo**: Mantén los iconos optimizados (usa herramientas como ImageOptim)
2. **Consistencia**: El icono debe verse similar en todas las plataformas
3. **Testing**: Prueba los iconos en cada plataforma antes del release final
4. **Branding**: Asegúrate de que el icono represente bien tu aplicación

## 🎯 Ejemplo de Diseño para Space Manager

Para una aplicación de gestión de espacios de trabajo, considera:
- **Símbolo**: Ventanas organizadas, carpetas estructuradas, o un espacio de trabajo
- **Colores**: Azul profesional, verde organizacional, o morado creativo
- **Estilo**: Moderno, minimalista, con líneas limpias

### Conceptos de Diseño:
1. **Opción 1**: Cuadrícula de ventanas/espacios
2. **Opción 2**: Carpetas organizadas en capas
3. **Opción 3**: Escritorio con múltiples áreas de trabajo
4. **Opción 4**: Iniciales "SM" estilizadas

## ✅ Checklist Final

Antes de crear el release con iconos:

- [ ] PNG 512×512 creado con transparencia
- [ ] Todos los PNGs de diferentes tamaños generados
- [ ] Archivo .ico creado para Windows
- [ ] Archivo .icns creado para macOS
- [ ] Archivos colocados en `resources/icons/`
- [ ] Iconos probados visualmente en diferentes tamaños
- [ ] electron-builder.yml actualizado (descomentando las líneas de iconos)
- [ ] Build de prueba ejecutado
- [ ] Iconos verificados en la aplicación instalada

---

**Tip**: Si necesitas ayuda con el diseño, puedes usar herramientas como:
- Canva (plantillas de iconos)
- Figma (diseño vectorial)
- Inkscape (alternativa gratuita a Illustrator)
- DALL-E o Midjourney (generación con IA)
