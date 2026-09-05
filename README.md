# PCForge: Elite PC Builder SPA

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](#)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Executive Summary:** A high-performance, Vanilla JavaScript Single Page Application (SPA) designed to simulate custom PC building. Features an advanced custom state-management system, real-time algorithmic compatibility checking, power draw analytics, and dynamic currency conversion.

## 🖥️ Application Interface

A single-page form-based build configurator: pick components from filterable dropdowns (brand, release year, price), watch live compatibility and power-draw feedback update as you go, and add the finished build to a shareable cart with currency conversion (GBP/USD/EUR).

---

## 💻 Tech Stack & Architecture

*   **Frontend Logic:** Vanilla JavaScript (ES6+)
*   **State Management:** Custom modular architecture (`State`, `UI`, and `App` controllers)
*   **Styling & Theming:** Custom CSS3 with CSS Variables (`:root`) and dynamic DOM manipulation for Dark Mode.
*   **Data Structure:** JSON-based component database.

## 🧠 Core Engineering Concepts Applied

*   **Algorithmic Compatibility Engine:** Engineered a deep-compatibility validation system that checks CPU socket types against Motherboards and enforces RAM generation (DDR3/DDR4/DDR5) strictness, alerting the user to mismatches.
*   **Live Power Analytics:** Calculates dynamic system wattage (TDP) based on selected components and validates it against the selected Power Supply Unit (PSU) capacity with visual gauge warnings.
*   **State Management & Persistence:** Utilizes a centralized state object to manage the active build, supporting Blob-based JSON export/import allowing users to save, download, and reload their custom builds.
*   **Dynamic UI & Localization:** Features a responsive CSS Grid layout, an interactive Smart Cart, multi-parameter filtering (by brand, release year, and price), and a live currency conversion engine (GBP, USD, EUR).

---

## 🚀 Getting Started

### Local Installation

This application runs entirely in the browser with no build tools or backend servers required.

1. Clone the repository:
   ```bash
   git clone https://github.com/ClxpI/New_PC_Builder_Website.git
   ```
2. Open `index.html` directly in a browser — no build step required.
