# Copilot Instructions for Azure Architecture Designer

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a web application for designing Azure architecture diagrams, similar to Microsoft Visio. The app provides a drag-and-drop canvas where users can place Azure service icons and create architecture diagrams.

## Tech Stack
- **Framework**: React with Vite
- **Styling**: CSS with modern flexbox/grid layouts
- **State Management**: React hooks (useState, useRef)
- **Canvas**: HTML5 Canvas or SVG for drawing connections

## Key Features
1. **Canvas Area**: Main workspace where users can place and arrange Azure service icons
2. **Toolbar**: Contains Azure service icons (VMs, Storage, Databases, Networks, etc.)
3. **Drag and Drop**: Users can drag icons from the toolbar onto the canvas
4. **Connections**: Draw lines/arrows between components to show relationships
5. **Control Buttons**: Save, Load, Clear, Export functionality
6. **Zoom & Pan**: Canvas navigation controls

## Code Style Guidelines
- Use functional components with hooks
- Keep components modular and reusable
- Use descriptive variable and function names
- Add comments for complex logic
- Follow React best practices
