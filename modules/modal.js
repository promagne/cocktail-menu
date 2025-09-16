/**
 * Modal Management Module
 * Handles cocktail detail modal functionality
 */

import domUtils from './dom.js';
import securityManager from './security.js';

class ModalManager {
    constructor() {
        this.modal = domUtils.getElement('cocktailModal');
        this.detail = domUtils.getElement('cocktailDetail');
        this.closeButton = domUtils.getElement('closeModal');
        this.initializeEventListeners();
    }

    // Initialize modal event listeners
    initializeEventListeners() {
        // Close button
        this.closeButton.addEventListener('click', () => {
            this.hide();
        });

        // Click outside modal to close
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.style.display === 'block') {
                this.hide();
            }
        });
    }

    // Show modal
    show() {
        domUtils.showModal();
    }

    // Hide modal
    hide() {
        domUtils.hideModal();
    }

    // Show cocktail detail in modal
    showCocktailDetail(cocktail) {
        // Fetch the recipe markdown
        fetch(cocktail.path)
            .then(response => response.text())
            .then(markdown => {
                this.renderCocktailDetail(cocktail, markdown);
                this.show();
            })
            .catch(error => {
                console.error('Error fetching recipe:', error);
                this.showError(cocktail, error.message);
                this.show();
            });
    }

    // Render cocktail detail content
    renderCocktailDetail(cocktail, markdown) {
        domUtils.clearElement(this.detail);

        // Remove frontmatter
        const contentWithoutFrontmatter = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');

        // Parse and sanitize markdown to safe HTML
        const safeHTML = securityManager.parseMarkdownSafely(contentWithoutFrontmatter);

        // Create detail header
        const detailHeader = domUtils.createElement('div', 'detail-header');
        const title = domUtils.createElement('h2', '', securityManager.sanitizeText(cocktail.name));
        detailHeader.appendChild(title);

        // Add status indicators
        const statusIndicators = domUtils.createElement('div', 'status-indicators');

        if (!cocktail.available) {
            const unavailableIndicator = domUtils.createElement('span', 'unavailable-indicator', '✕');
            statusIndicators.appendChild(unavailableIndicator);
        }
        if (cocktail.favorite) {
            const favoriteIndicator = domUtils.createElement('span', 'favorite-indicator', '★');
            statusIndicators.appendChild(favoriteIndicator);
        }

        detailHeader.appendChild(statusIndicators);
        this.detail.appendChild(detailHeader);

        // Add flavor tags if any
        if (cocktail.flavor && Array.isArray(cocktail.flavor) && cocktail.flavor.length > 0) {
            const flavorTags = domUtils.createElement('div', 'detail-tags');
            cocktail.flavor.forEach(flavor => {
                const tag = domUtils.createElement('span', 'detail-tag detail-tag--flavor', flavor);
                flavorTags.appendChild(tag);
            });
            this.detail.appendChild(flavorTags);
        }

        // Add alcohol tags if any
        if (cocktail.alcohol && Array.isArray(cocktail.alcohol) && cocktail.alcohol.length > 0) {
            const alcoholTags = domUtils.createElement('div', 'detail-tags');
            cocktail.alcohol.forEach(alcohol => {
                const tag = domUtils.createElement('span', 'detail-tag detail-tag--alcohol', alcohol);
                alcoholTags.appendChild(tag);
            });
            this.detail.appendChild(alcoholTags);
        }

        // Add content with safe HTML
        const detailContent = domUtils.createElement('div', 'detail-content');
        securityManager.setSafeHTML(detailContent, safeHTML);
        this.detail.appendChild(detailContent);
    }

    // Show error in modal
    showError(cocktail, errorMessage) {
        domUtils.clearElement(this.detail);

        const errorContent = domUtils.createElement('div', 'error-content');
        const title = domUtils.createElement('h2', '', `Error loading ${securityManager.sanitizeText(cocktail.name)}`);
        const message = domUtils.createElement('p', '', `Failed to load recipe: ${securityManager.sanitizeText(errorMessage)}`);

        errorContent.appendChild(title);
        errorContent.appendChild(message);
        this.detail.appendChild(errorContent);
    }
}

// Export singleton instance
const modalManager = new ModalManager();
export default modalManager;