# Chemistry Interactive Learning Tool

## Project Overview
A stunning chemistry-themed interactive learning platform where students enter session codes to access educational content. Built by Jordan Rodrigues for engaging chemistry education.

## Architecture Requirements

### Deployment & Infrastructure
- **Deployment Platform**: Netlify (fully static site)
- **NO Backend/Server**: Must be completely static - NO Express.js or server-side code
- **Database**: Supabase (serverless/client-side database calls only)
- **Frontend**: React SPA with Tailwind CSS and chemistry-themed animations

### Database Configuration
- Using Supabase for all data persistence
- Requires SUPABASE_URL and SUPABASE_ANON_KEY environment variables
- All database operations must be client-side using Supabase JavaScript client

### Current Implementation Status
- ✅ Beautiful chemistry-themed homepage with interactive elements
- ✅ Session code validation (currently hardcoded to "CHEMWITHJ")
- ✅ Animated molecular background and scrambled text effects
- ✅ Individual quiz functionality with shape sequence security check
- ✅ NMR module-based learning system with sequential unlocking
- ✅ Real-time multiplayer quiz system with WebSocket server
- ✅ Presenter page at /present for big screen display
- ✅ HNMR-style scoring graphs for live quiz results
- ⏳ Needs conversion to static-only architecture
- ⏳ Supabase integration pending credentials

### Key Features
- Interactive chemistry background with floating molecules
- Animated welcome box with hand pointer
- Session code input with real-time validation
- Scrambled text button that unscrambles with 3D effects
- Fully responsive design optimized for students and teachers

### Development Notes
- All components built with shadcn/ui and Tailwind CSS
- Animations use CSS and React state (no external animation libraries for core interactions)
- Chemistry theming throughout with periodic table elements and molecular structures
- Must maintain compatibility with Netlify static site deployment