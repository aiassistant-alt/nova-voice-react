# Nova Voice React

**Version 1.0.0**

A modern neumorphic voice assistant interface built with React, featuring multi-theme support, interactive lessons, and an AI quiz system.

## Features

- **Neumorphic Design System**: Soft, modern UI with depth and shadows
- **Multi-Theme Support**: Four distinct themes (White, Black, Blue, Purple)
- **Interactive Voice Assistant**: Central animated interface with wave emissions
- **Lesson Management**: Module-based learning system with progress tracking
- **AI Quiz System**: Interactive quiz sidebar with explanations
- **Responsive Controls**: Play/pause and mute functionality
- **Smooth Animations**: CSS-based animations and transitions

## Tech Stack

- **React 18**: Core framework
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **FontAwesome**: Icon library
- **PostCSS**: CSS processing

## Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd nova-voice-react

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
nova-voice-react/
├── src/
│   ├── components/
│   │   ├── VoiceAssistant.jsx  # Central animated circle
│   │   ├── Sidebar.jsx         # Left lesson sidebar
│   │   ├── QuizSidebar.jsx     # Right quiz panel
│   │   ├── Header.jsx          # Top navigation and badges
│   │   └── Controls.jsx        # Bottom control buttons
│   ├── styles/
│   │   ├── themes.css          # Theme variable definitions
│   │   ├── animations.css      # Keyframe animations
│   │   └── components.css      # Component-specific styles
│   ├── App.jsx                 # Main application component
│   └── index.css               # Main stylesheet
├── package.json
└── vite.config.js
```

## Theme System

The application supports four themes, each with distinct color schemes:

- **White**: Clean, minimalist light theme
- **Black**: Dark theme with high contrast
- **Blue**: Deep ocean-inspired theme
- **Purple**: Rich, mystical purple theme

Themes can be cycled using the theme button in the sidebar footer.

## Components

### VoiceAssistant
Central neumorphic circle with animated gradient and wave emissions when active.

### Sidebar
Left panel containing:
- Module dropdown selector
- Lesson list with progress bars
- Theme switcher button

### QuizSidebar
Right panel featuring:
- Multiple choice questions
- Answer explanations
- Progress navigation

### Header
Top section with:
- Hamburger menu toggle
- Status badges (HABLANDO/ESCUCHANDO)
- Current lesson display

### Controls
Bottom control bar with backward, mute, and forward buttons.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Author

Nova Voice Team