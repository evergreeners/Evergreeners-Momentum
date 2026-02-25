# Evergreeners-Momentum

**Evergreeners-Momentum** is a modern, client-side web application built with React 19 and TypeScript, designed to visualize data trends and provide AI-driven insights. The application leverages Google's Generative AI for intelligence layers and Recharts for interactive data visualization, wrapped in a high-performance Vite environment.

## 🚀 Project Overview

This repository houses a frontend application focused on momentum tracking (implied by the name and data visualization stack). It employs a modular architecture where UI components are separated from business logic and AI service integrations.

### Key Capabilities
*   **AI-Powered Insights:** Integrated with **Google GenAI** SDK to provide intelligent analysis or content generation based on application data.
*   **Data Visualization:** Utilizes **Recharts** to render complex data sets into interactive charts and graphs, allowing users to visualize "momentum" or trends.
*   **Modern React Architecture:** Built on **React 19**, utilizing the latest hook patterns and rendering optimizations.
*   **Type Safety:** Fully typed codebase using **TypeScript 5.8**, ensuring robust data handling and developer ergonomics.
*   **Responsive UI:** Enhanced with **Lucide React** for consistent, scalable vector iconography.

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Core Framework** | React | ^19.2.4 |
| **Build Tool** | Vite | ^6.2.0 |
| **Language** | TypeScript | ~5.8.2 |
| **AI Integration** | Google GenAI SDK | ^1.41.0 |
| **Visualization** | Recharts | ^3.7.0 |
| **Icons** | Lucide React | ^0.564.0 |

## 📂 Repository Structure

The project follows a clean separation of concerns, typical of modern React applications:

```text
evergreeners-momentum/
├── components/       # Reusable UI components (Charts, Cards, Layouts)
├── services/         # Business logic and external API integrations (Google GenAI)
├── App.tsx           # Main application root component
├── index.tsx         # Application entry point
├── types.ts          # Shared TypeScript interfaces and type definitions
├── vite.config.ts    # Vite configuration settings
├── tsconfig.json     # TypeScript compiler options
├── package.json      # Dependencies and scripts
└── index.html        # HTML entry point
```

## ⚡ Getting Started

### Prerequisites
*   **Node.js** (Latest LTS recommended)
*   **npm** or **yarn**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/evergreeners-momentum.git
    cd evergreeners-momentum
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Since this project uses `@google/genai`, you will likely need an API key. Create a `.env` file in the root directory:
    ```env
    VITE_GOOGLE_GENAI_KEY=your_api_key_here
    ```

### Development

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Production Build

To create a production-ready build:

```bash
npm run build
```
This compiles the application into the `dist` folder, optimizing assets for performance.

To preview the production build locally:
```bash
npm run preview
```

## 🧩 Architecture Notes

*   **Services Layer (`/services`):** This directory handles direct interaction with the Google GenAI API. It abstracts the complexity of AI prompts and responses, exposing clean functions to the React components.
*   **Data Layer (`types.ts`):** Centralizes the data models used by Recharts and the application state to ensure consistency across the dashboard.
*   **Component Strategy:** The application likely uses functional components with Hooks. Recharts components are wrapped here to standardize styling and configuration across the app.

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Compiles the TypeScript/React code for production. |
| `npm run preview` | Serves the production build locally for testing. |

## 📄 License

This project is private and proprietary.
*(See `package.json` configuration: `"private": true`)*