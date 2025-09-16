/**
 * Main Application Entry Point - Modular Version
 * Clean, organized, and maintainable cocktail menu application
 */

import appState from './modules/state.js';
import domUtils from './modules/dom.js';
import filterManager from './modules/filters.js';
import modalManager from './modules/modal.js';
import renderer from './modules/renderer.js';
import apiClient from './modules/api.js';
import securityManager from './modules/security.js';

class CocktailMenuApp {
    constructor() {
        this.initialized = false;
    }

    // Initialize the application
    async initialize() {
        if (this.initialized) return;

        console.log('Initializing Cocktail Menu App...');

        try {
            // Initialize security configuration
            securityManager.configureMarked();

            // Initialize DOM utilities
            domUtils.init();

            // Initialize renderer with state subscriptions
            renderer.initialize();

            // Set up filter event listeners
            filterManager.initializeFilters(() => {
                renderer.renderCocktails();
            });

            // Load initial data
            await apiClient.initialize();

            // Render initial UI
            renderer.renderAll();

            console.log('Cocktail Menu App initialized successfully!');
            this.initialized = true;

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showInitializationError(error);
        }
    }

    // Show initialization error
    showInitializationError(error) {
        const cocktailsGrid = domUtils.getElement('cocktailsGrid');
        if (cocktailsGrid) {
            domUtils.clearElement(cocktailsGrid);
            const errorDiv = domUtils.createElement('div', 'error-message',
                `Failed to initialize application: ${error.message}`);
            cocktailsGrid.appendChild(errorDiv);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new CocktailMenuApp();
    await app.initialize();
});