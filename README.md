# Nova Voice React - AI Voice Assistant Interface
🎯 **Production URL:** https://d3f72jsw0i6z0k.cloudfront.net

## 🚀 Descripción del Proyecto

Nova Voice React es una interfaz de usuario futurista para un asistente de voz con IA. Diseñada con un estilo neumórfico moderno, ofrece una experiencia de aprendizaje interactiva con lecciones modulares, sistema de quiz con IA, y un editor de documentos integrado.

### 🎨 Características Principales

- **Diseño Neumórfico Avanzado**: Interfaz con profundidad visual y sombras dinámicas
- **4 Temas Globales**: White, Black (Chrome Dark), Blue, Purple - todos sincronizados
- **Sistema de Lecciones Modular**: 3 módulos con múltiples lecciones interactivas
- **Quiz con IA**: Sistema de preguntas y respuestas inteligente
- **Editor de Documentos**: Similar a Microsoft Word con generación de contenido con IA
- **Voice Assistant**: Círculo neumórfico animado con integración de audio real
- **100% Responsivo**: Adaptado para todos los dispositivos

## 🛠️ Stack Tecnológico

- **Frontend Framework**: React 18.3.1 con Vite
- **Estilos**: TailwindCSS + CSS personalizado con variables dinámicas
- **Routing**: React Router DOM v7
- **Audio**: Integración con Nova Sonic Server (WebSocket)
- **Deployment**: AWS S3 + CloudFront
- **Autenticación**: AWS Cognito

## 📁 Estructura del Proyecto

```
nova-voice-react/
├── src/
│   ├── components/          # Componentes React
│   │   ├── VoiceAssistant.jsx    # Círculo neumórfico principal
│   │   ├── Sidebar.jsx           # Sidebar izquierdo con lecciones
│   │   ├── QuizSidebar.jsx       # Sidebar derecho con quiz IA
│   │   ├── Header.jsx            # Header con indicadores de estado
│   │   ├── Controls.jsx          # Controles de reproducción
│   │   ├── Library.jsx           # Página de biblioteca/editor
│   │   └── LoginPage.jsx         # Página de autenticación
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useAuth.js           # Hook de autenticación
│   │   └── useNovaAudio.js      # Hook para audio Nova Sonic
│   │
│   ├── styles/              # Estilos modulares
│   │   ├── themes.css           # Definición de temas
│   │   ├── animations.css       # Animaciones CSS
│   │   └── components.css       # Estilos de componentes
│   │
│   ├── App.jsx              # Componente principal
│   ├── main.jsx            # Entry point
│   └── index.css           # Estilos globales
│
├── public/                  # Archivos estáticos
├── dist/                   # Build de producción
└── package.json           # Dependencias y scripts
```

## 🎨 Sistema de Temas

El proyecto cuenta con 4 temas completamente sincronizados:

### White Theme (Default)
- Fondo blanco puro con sombras grises suaves
- Texto negro con acentos oscuros
- Estilo minimalista y limpio

### Black Theme (Chrome Dark)
- Paleta de grises oscuros estilo Chrome
- Sin azules, solo grises y negros
- Bordes mate sin brillo

### Blue Theme
- Tonos azules profundos
- Acentos cian brillantes
- Ideal para modo nocturno

### Purple Theme
- Tonos púrpura oscuros
- Acentos violeta vibrantes
- Estilo místico y elegante

## 🔧 Instalación y Configuración

### Prerrequisitos
```bash
# Node.js 18+ y npm
node --version
npm --version

# AWS CLI configurado
aws configure
```

### Instalación Local
```bash
# Clonar repositorio
git clone [repository-url]
cd nova-voice-react

# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build producción
npm run build

# Preview build local
npm run preview
```

## 🚀 Deployment en AWS

### Configuración S3 + CloudFront

1. **Bucket S3**: `nova-voice-frontend-1756259461`
   - Hosting estático habilitado
   - Política de bucket pública configurada

2. **CloudFront Distribution**: `E1G16A72A2NBFH`
   - URL: https://d3f72jsw0i6z0k.cloudfront.net
   - Caché optimizado para SPA
   - Compresión automática

### Scripts de Deployment
```bash
# Build y deploy a producción
npm run build
aws s3 sync dist/ s3://nova-voice-frontend-1756259461 --delete
aws cloudfront create-invalidation --distribution-id E1G16A72A2NBFH --paths "/*"
```

## 📝 Documentación de Componentes

### VoiceAssistant
```jsx
// Círculo neumórfico principal con animación
// Integración con Nova Sonic Server para audio real
// Props: isPlaying, togglePlay, onListeningChange, onNovaPlayingChange
```

### Sidebar
```jsx
// Sidebar izquierdo con lecciones modulares
// Sistema de 3 módulos con 6 lecciones cada uno
// Props: active, toggleSidebar, currentModule, setCurrentModule, setCurrentLesson, theme, setTheme
```

### QuizSidebar
```jsx
// Quiz interactivo con IA
// 5 preguntas con explicaciones detalladas
// Props: active, toggleQuiz
```

### Library
```jsx
// Editor de documentos estilo Word
// Generación de contenido con IA integrada
// Props: theme, setTheme
```

## 🔐 Autenticación

Sistema de autenticación implementado con AWS Cognito:
- Login con email/contraseña
- Registro de nuevos usuarios
- Recuperación de contraseña
- Tokens JWT para sesiones seguras

## 🎯 Features Implementadas

✅ **Diseño Neumórfico Completo**
- Sombras dinámicas y profundidad 3D
- Transiciones suaves y animaciones fluidas
- Efectos hover y active states

✅ **Sistema de Lecciones**
- 3 módulos con contenido progresivo
- Tracking de progreso (removido visualmente)
- Bloqueo/desbloqueo de lecciones

✅ **Quiz con IA**
- Preguntas de opción múltiple
- Explicaciones automáticas
- Navegación entre preguntas

✅ **Editor de Documentos**
- Input de texto enriquecido
- Generación con IA
- Guardado y compartir

✅ **Integración de Audio**
- WebSocket con Nova Sonic Server
- Grabación y reproducción de voz
- Indicadores visuales de estado

## 📊 Estado del Proyecto

- **Versión**: 1.0.0
- **Estado**: Producción
- **Última actualización**: 27 de Agosto 2024
- **Creador**: AI Assistant para Nova Voice
- **Mantenimiento**: Activo

## 🐛 Known Issues

- Las fuentes FontAwesome pueden tardar en cargar en primera visita
- El WebSocket de audio requiere Nova Sonic Server activo
- Los imports de CSS muestran warnings en build (no afectan funcionalidad)

## 📈 Mejoras Futuras

- [ ] Integración completa con backend de procesamiento de voz
- [ ] Sistema de usuarios y perfiles personalizados
- [ ] Más idiomas y dialectos
- [ ] Analytics y tracking de progreso detallado
- [ ] Modo offline con Service Workers
- [ ] Tests unitarios y de integración

## 💻 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo en http://localhost:5173

# Build
npm run build        # Build de producción en ./dist
npm run preview      # Preview del build local

# Linting
npm run lint         # ESLint check

# Deployment
npm run deploy       # Build + sync S3 + invalidate CloudFront (requiere script custom)
```

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2024 Nova Voice

## 🤝 Contribuciones

Este proyecto está cerrado a contribuciones externas.

## 📞 Contacto y Soporte

Para soporte técnico o consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Nova Voice React** - *Redefiniendo la interacción humano-máquina con IA y diseño neumórfico*