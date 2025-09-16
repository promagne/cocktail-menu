/**
 * Filter Logic Module
 * Handles cocktail filtering and search functionality
 */

import appState from './state.js';
import domUtils from './dom.js';
import securityManager from './security.js';

class FilterManager {
    constructor() {
        this.searchInput = domUtils.getElement('searchInput');
    }

    // Filter cocktails based on all active filters
    filterCocktails() {
        const cocktails = appState.getCocktails();
        const searchTerm = securityManager.sanitizeInput(this.searchInput.value.toLowerCase());
        const activeFlavorTags = appState.getActiveFlavorTags();
        const activeAlcoholTags = appState.getActiveAlcoholTags();
        const activeAvailabilityTag = appState.getAvailabilityTag();
        const activeFavoriteTag = appState.getFavoriteTag();

        return cocktails.filter(cocktail => {
            // Search filter
            const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm);

            // Availability filter
            const matchesAvailability =
                activeAvailabilityTag === 'all' ||
                (activeAvailabilityTag === 'available' && cocktail.available) ||
                (activeAvailabilityTag === 'unavailable' && !cocktail.available);

            // Favorite filter
            const matchesFavorite =
                activeFavoriteTag === 'all' ||
                (activeFavoriteTag === 'favorite' && cocktail.favorite);

            // Flavor tags filter
            const matchesFlavorTags =
                activeFlavorTags.length === 0 ||
                (cocktail.flavor && activeFlavorTags.every(tag => cocktail.flavor.includes(tag)));

            // Alcohol tags filter
            const matchesAlcoholTags =
                activeAlcoholTags.length === 0 ||
                (cocktail.alcohol && activeAlcoholTags.some(tag => cocktail.alcohol.includes(tag)));

            return matchesSearch && matchesAvailability && matchesFavorite && matchesFlavorTags && matchesAlcoholTags;
        });
    }

    // Set up search input event listener
    setupSearchListener(onSearchCallback) {
        this.searchInput.addEventListener('input', () => {
            onSearchCallback();
        });
    }

    // Set up availability filter listeners
    setupAvailabilityListeners(onFilterChangeCallback) {
        const availabilityTags = domUtils.getElement('availabilityTags');
        const availabilityTagElements = availabilityTags.querySelectorAll('.filter-tag--availability');

        availabilityTagElements.forEach(tag => {
            tag.addEventListener('click', () => {
                // Remove active from all
                availabilityTagElements.forEach(t => t.classList.remove('active'));

                // Add active to clicked
                tag.classList.add('active');

                // Update state
                const value = tag.getAttribute('data-value');
                appState.setAvailabilityTag(value);

                onFilterChangeCallback();
            });
        });
    }

    // Set up favorite filter listeners
    setupFavoriteListeners(onFilterChangeCallback) {
        const favoriteTags = domUtils.getElement('favoriteTags');
        const favoriteTagElements = favoriteTags.querySelectorAll('.filter-tag--favorite');

        favoriteTagElements.forEach(tag => {
            tag.addEventListener('click', () => {
                // Remove active from all
                favoriteTagElements.forEach(t => t.classList.remove('active'));

                // Add active to clicked
                tag.classList.add('active');

                // Update state
                const value = tag.getAttribute('data-value');
                appState.setFavoriteTag(value);

                onFilterChangeCallback();
            });
        });
    }

    // Set up flavor tag listeners
    setupFlavorTagListeners(onFilterChangeCallback) {
        const flavorContainer = domUtils.getElement('flavorTagsContainer');

        domUtils.delegateEvent(flavorContainer, '.filter-tag--flavor', 'click', (e) => {
            const tag = e.target.textContent;
            const isActive = e.target.classList.contains('active');

            // Toggle visual state
            domUtils.updateTagState(e.target, !isActive);

            // Update state
            appState.toggleFlavorTag(tag);

            onFilterChangeCallback();
        });
    }

    // Set up alcohol tag listeners
    setupAlcoholTagListeners(onFilterChangeCallback) {
        const alcoholContainer = domUtils.getElement('alcoholTagsContainer');

        domUtils.delegateEvent(alcoholContainer, '.filter-tag--alcohol', 'click', (e) => {
            const tag = e.target.textContent;
            const isActive = e.target.classList.contains('active');

            // Toggle visual state
            domUtils.updateTagState(e.target, !isActive);

            // Update state
            appState.toggleAlcoholTag(tag);

            onFilterChangeCallback();
        });
    }

    // Set up all filter toggles
    setupFilterToggles() {
        domUtils.setupFilterToggle('toggleAvailability', '.filter-group--availability');
        domUtils.setupFilterToggle('toggleFavorites', '.filter-group--favorite');
        domUtils.setupFilterToggle('toggleFlavor', '.filter-group--flavor');
        domUtils.setupFilterToggle('toggleAlcohol', '.filter-group--alcohol');
    }

    // Initialize all filter event listeners
    initializeFilters(onFilterChangeCallback) {
        this.setupSearchListener(onFilterChangeCallback);
        this.setupAvailabilityListeners(onFilterChangeCallback);
        this.setupFavoriteListeners(onFilterChangeCallback);
        this.setupFlavorTagListeners(onFilterChangeCallback);
        this.setupAlcoholTagListeners(onFilterChangeCallback);
        this.setupFilterToggles();
    }
}

// Export singleton instance
const filterManager = new FilterManager();
export default filterManager;