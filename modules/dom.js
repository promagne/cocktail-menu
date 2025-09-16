/**
 * DOM Utilities Module
 * Provides DOM manipulation helpers and element references
 */

import securityManager from './security.js';

class DOMUtils {
    constructor() {
        this.elements = {};
        this.init();
    }

    init() {
        // Cache DOM element references
        this.elements = {
            cocktailsGrid: document.getElementById('cocktailsGrid'),
            searchInput: document.getElementById('searchInput'),
            availabilityTags: document.getElementById('availabilityTags'),
            favoriteTags: document.getElementById('favoriteTags'),
            flavorTagsContainer: document.getElementById('flavorTags'),
            alcoholTagsContainer: document.getElementById('alcoholTags'),
            cocktailModal: document.getElementById('cocktailModal'),
            cocktailDetail: document.getElementById('cocktailDetail'),
            closeModal: document.querySelector('.close-modal')
        };
    }

    // Get cached DOM element
    getElement(name) {
        return this.elements[name];
    }

    // Create element with attributes and content (secured)
    createElement(tag, className, textContent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) securityManager.setSafeText(element, textContent);
        return element;
    }

    // Clear all children from element
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Show modal
    showModal() {
        this.elements.cocktailModal.style.display = 'block';
    }

    // Hide modal
    hideModal() {
        this.elements.cocktailModal.style.display = 'none';
    }

    // Set up toggle functionality for filter groups
    setupFilterToggle(buttonId, groupSelector) {
        const toggleButton = document.getElementById(buttonId);
        const filterGroup = document.querySelector(groupSelector);

        if (!toggleButton || !filterGroup) return;

        // Set initial state
        const isCollapsed = filterGroup.classList.contains('collapsed');
        toggleButton.textContent = isCollapsed ? '▶' : '▼';

        toggleButton.addEventListener('click', () => {
            this.toggleFilterGroup(filterGroup, toggleButton);
        });

        // Also allow clicking on the entire header to toggle
        const groupHeader = filterGroup.querySelector('.group-header');
        if (groupHeader) {
            groupHeader.style.cursor = 'pointer';
            groupHeader.addEventListener('click', () => {
                this.toggleFilterGroup(filterGroup, toggleButton);
            });
        }
    }

    // Toggle filter group state
    toggleFilterGroup(filterGroup, toggleButton) {
        filterGroup.classList.toggle('collapsed');
        const isCollapsed = filterGroup.classList.contains('collapsed');
        toggleButton.textContent = isCollapsed ? '▶' : '▼';
    }

    // Add event listener with delegation
    delegateEvent(parent, selector, event, handler) {
        parent.addEventListener(event, function(e) {
            if (e.target.matches && e.target.matches(selector)) {
                handler(e);
            }
        });
    }

    // Create cocktail card element
    createCocktailCard(cocktail) {
        const card = this.createElement('div', 'cocktail-card');

        // Create card header
        const cardHeader = this.createElement('div', 'card-header');
        const title = this.createElement('h3', '', cocktail.name);
        cardHeader.appendChild(title);

        // Add status indicators
        if (!cocktail.available) {
            const unavailableSpan = this.createElement('span', 'status-indicator unavailable', '✕');
            cardHeader.appendChild(unavailableSpan);
        }
        if (cocktail.favorite) {
            const favoriteSpan = this.createElement('span', 'status-indicator favorite', '★');
            cardHeader.appendChild(favoriteSpan);
        }

        card.appendChild(cardHeader);

        // Add flavor tags if present
        if (cocktail.flavor && Array.isArray(cocktail.flavor) && cocktail.flavor.length > 0) {
            const tagList = this.createElement('div', 'card-tag-list');
            cocktail.flavor.forEach(flavor => {
                const flavorTag = this.createElement('span', 'card-tag card-tag--flavor', flavor);
                tagList.appendChild(flavorTag);
            });
            card.appendChild(tagList);
        }

        // Add ingredients list
        const ingredients = Array.isArray(cocktail.ingredients) ? cocktail.ingredients : [];
        const displayIngredients = ingredients.slice(0, 4);
        const hasMoreIngredients = ingredients.length > 4;

        const ingredientsList = this.createElement('div', 'ingredients-list');
        displayIngredients.forEach(ingredient => {
            const ingredientSpan = this.createElement('span', 'ingredient', ingredient);
            ingredientsList.appendChild(ingredientSpan);
        });

        if (hasMoreIngredients) {
            const moreSpan = this.createElement('span', 'ingredient more', '+more');
            ingredientsList.appendChild(moreSpan);
        }

        card.appendChild(ingredientsList);

        return card;
    }

    // Create filter tag element
    createFilterTag(tag, className, isActive = false) {
        const tagEl = this.createElement('div', className, tag);
        if (isActive) tagEl.classList.add('active');
        return tagEl;
    }

    // Update tag active state
    updateTagState(tagElement, isActive) {
        if (isActive) {
            tagElement.classList.add('active');
        } else {
            tagElement.classList.remove('active');
        }
    }
}

// Export singleton instance
const domUtils = new DOMUtils();
export default domUtils;