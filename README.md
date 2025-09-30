# Campus Placement Portal

A modern, intelligent platform designed to streamline campus placement processes for students, faculty, and recruiters. Built with React, Firebase, and cutting-edge UI technologies.

## Features

### Core Features
- **Smart Job Matching**: AI-powered recommendations based on skills and preferences
- **One-Click Applications**: Unified profile system for seamless applications
- **Real-time Tracking**: Comprehensive dashboards for all stakeholders
- **Automated Approvals**: Streamlined faculty signoffs without paperwork

### Design & UX
- **Modern UI**: Clean, minimalistic design with red (#D32F2F) and white theme
- **Dark Mode**: Seamless theme switching with smooth animations
- **Responsive Design**: Mobile-first approach with perfect tablet and desktop layouts
- **Accessibility**: Full keyboard navigation and screen reader support
- **Smooth Animations**: Framer Motion powered transitions and interactions

### Technical Features
- **React 18**: Modern functional components with hooks
- **React Router**: Client-side routing with animated transitions
- **Styled Components**: CSS-in-JS with theme support
- **Framer Motion**: Smooth animations and micro-interactions
- **Firebase Integration**: Authentication, Firestore, Storage, and Functions
- **PWA Ready**: Progressive Web App with offline support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Campus-placement-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation with theme toggle
│   ├── Footer.jsx      # Site footer with links
│   └── FeatureCard.jsx # Feature showcase cards
├── contexts/           # React Context providers
│   └── ThemeContext.jsx # Theme management
├── pages/              # Route components
│   ├── Home.jsx        # Landing page
│   ├── About.jsx       # About page
│   ├── Login.jsx       # Authentication
│   ├── Signup.jsx      # User registration
│   └── Dashboard.jsx   # User dashboard
├── styles/             # Global styles
│   └── GlobalStyles.js # Styled-components global styles
├── firebase.js         # Firebase configuration
└── App.jsx            # Main app component
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Theme System

The application uses a comprehensive theme system with light and dark modes, smooth transitions, and consistent color schemes throughout.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for the campus community**
