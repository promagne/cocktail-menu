/**
 * Renderer Module
 * Handles cocktail grid rendering and tag display
 */

import appState from './state.js';
import domUtils from './dom.js';
import filterManager from './filters.js';
import modalManager from './modal.js';

class Renderer {
    constructor() {
        this.cocktailsGrid = domUtils.getElement('cocktailsGrid');
        this.flavorTagsContainer = domUtils.getElement('flavorTagsContainer');
        this.alcoholTagsContainer = domUtils.getElement('alcoholTagsContainer');
    }

    // Render cocktails in the grid
    renderCocktails() {
        domUtils.clearElement(this.cocktailsGrid);

        const filteredCocktails = filterManager.filterCocktails();

        if (filteredCocktails.length === 0) {
            const noResults = domUtils.createElement('div', 'no-results', 'No cocktails match your filters');
            this.cocktailsGrid.appendChild(noResults);
            return;
        }

        filteredCocktails.forEach(cocktail => {
            const card = domUtils.createCocktailCard(cocktail);

            // Add click event to show detail
            card.addEventListener('click', () => {
                modalManager.showCocktailDetail(cocktail);
            });

            this.cocktailsGrid.appendChild(card);
        });
    }

    // Render flavor tags for filtering
    renderFlavorTags() {
        domUtils.clearElement(this.flavorTagsContainer);

        const flavorTags = appState.getFlavorTags();
        const activeFlavorTags = appState.getActiveFlavorTags();

        if (flavorTags.length === 0) {
            const noTags = domUtils.createElement('div', 'no-tags', 'No flavor tags available');
            this.flavorTagsContainer.appendChild(noTags);
            return;
        }

        flavorTags.forEach(tag => {
            const isActive = activeFlavorTags.includes(tag);
            const tagEl = domUtils.createFilterTag(tag, 'filter-tag filter-tag--flavor', isActive);
            this.flavorTagsContainer.appendChild(tagEl);
        });
    }

    // Render alcohol tags for filtering
    renderAlcoholTags() {
        domUtils.clearElement(this.alcoholTagsContainer);

        const alcoholTags = appState.getAlcoholTags();
        const activeAlcoholTags = appState.getActiveAlcoholTags();

        if (alcoholTags.length === 0) {
            const noTags = domUtils.createElement('div', 'no-tags', 'No alcohol tags available');
            this.alcoholTagsContainer.appendChild(noTags);
            return;
        }

        alcoholTags.forEach(tag => {
            const isActive = activeAlcoholTags.includes(tag);
            const tagEl = domUtils.createFilterTag(tag, 'filter-tag filter-tag--alcohol', isActive);
            this.alcoholTagsContainer.appendChild(tagEl);
        });
    }

    // Render all UI components
    renderAll() {
        this.renderCocktails();
        this.renderFlavorTags();
        this.renderAlcoholTags();
    }

    // Initialize renderer with state subscriptions
    initialize() {
        // Subscribe to state changes
        appState.subscribe((changes) => {
            switch (changes.type) {
                case 'cocktails':
                    this.renderCocktails();
                    break;
                case 'flavorTags':
                    this.renderFlavorTags();
                    break;
                case 'alcoholTags':
                    this.renderAlcoholTags();
                    break;
                case 'activeFlavorTags':
                case 'activeAlcoholTags':
                case 'availabilityTag':
                case 'favoriteTag':
                    this.renderCocktails();
                    break;
            }
        });
    }
}

// Export singleton instance
const renderer = new Renderer();
export default renderer;