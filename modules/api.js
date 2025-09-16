/**
 * API Client Module
 * Handles server communication and data fetching
 */

import appState from './state.js';
import domUtils from './dom.js';

class ApiClient {
    constructor() {
        this.baseUrl = window.location.origin;
    }

    // Fetch cocktails data from server
    async fetchCocktails() {
        try {
            const response = await fetch(`${this.baseUrl}/api/cocktails`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const cocktails = await response.json();

            // Update state with fetched data
            appState.setCocktails(cocktails);
            appState.extractFlavorTags();
            appState.extractAlcoholTags();

            return cocktails;
        } catch (error) {
            console.error('Error fetching cocktails:', error);
            this.showError('Failed to load cocktails. Please refresh the page.');
            throw error;
        }
    }

    // Fetch single cocktail recipe
    async fetchCocktailRecipe(path) {
        try {
            const response = await fetch(`${this.baseUrl}/${path}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.error('Error fetching recipe:', error);
            throw error;
        }
    }

    // Show error message to user
    showError(message) {
        const cocktailsGrid = domUtils.getElement('cocktailsGrid');
        domUtils.clearElement(cocktailsGrid);

        const errorDiv = domUtils.createElement('div', 'error-message', message);
        cocktailsGrid.appendChild(errorDiv);
    }

    // Initialize data loading
    async initialize() {
        try {
            await this.fetchCocktails();
        } catch (error) {
            // Error already handled in fetchCocktails
        }
    }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;