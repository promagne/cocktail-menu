/**
 * State Management Module
 * Handles application state and data management
 */

class AppState {
    constructor() {
        this.cocktails = [];
        this.activeFlavorTags = [];
        this.allFlavorTags = [];
        this.activeAlcoholTags = [];
        this.allAlcoholTags = [];
        this.activeAvailabilityTag = 'all';
        this.activeFavoriteTag = 'all';
        this.observers = [];
    }

    // Observable pattern for state changes
    subscribe(observer) {
        this.observers.push(observer);
    }

    notify(changes) {
        this.observers.forEach(observer => observer(changes));
    }

    // Cocktails
    setCocktails(cocktails) {
        this.cocktails = cocktails;
        this.notify({ type: 'cocktails', data: cocktails });
    }

    getCocktails() {
        return this.cocktails;
    }

    // Flavor tags
    setFlavorTags(tags) {
        this.allFlavorTags = tags;
        this.notify({ type: 'flavorTags', data: tags });
    }

    getFlavorTags() {
        return this.allFlavorTags;
    }

    toggleFlavorTag(tag) {
        if (this.activeFlavorTags.includes(tag)) {
            this.activeFlavorTags = this.activeFlavorTags.filter(t => t !== tag);
        } else {
            this.activeFlavorTags.push(tag);
        }
        this.notify({ type: 'activeFlavorTags', data: this.activeFlavorTags });
    }

    getActiveFlavorTags() {
        return this.activeFlavorTags;
    }

    // Alcohol tags
    setAlcoholTags(tags) {
        this.allAlcoholTags = tags;
        this.notify({ type: 'alcoholTags', data: tags });
    }

    getAlcoholTags() {
        return this.allAlcoholTags;
    }

    toggleAlcoholTag(tag) {
        if (this.activeAlcoholTags.includes(tag)) {
            this.activeAlcoholTags = this.activeAlcoholTags.filter(t => t !== tag);
        } else {
            this.activeAlcoholTags.push(tag);
        }
        this.notify({ type: 'activeAlcoholTags', data: this.activeAlcoholTags });
    }

    getActiveAlcoholTags() {
        return this.activeAlcoholTags;
    }

    // Availability
    setAvailabilityTag(tag) {
        this.activeAvailabilityTag = tag;
        this.notify({ type: 'availabilityTag', data: tag });
    }

    getAvailabilityTag() {
        return this.activeAvailabilityTag;
    }

    // Favorites
    setFavoriteTag(tag) {
        this.activeFavoriteTag = tag;
        this.notify({ type: 'favoriteTag', data: tag });
    }

    getFavoriteTag() {
        return this.activeFavoriteTag;
    }

    // Extract unique tags from cocktails
    extractFlavorTags() {
        const tagsSet = new Set();
        this.cocktails.forEach(cocktail => {
            if (cocktail.flavor && Array.isArray(cocktail.flavor)) {
                cocktail.flavor.forEach(tag => tagsSet.add(tag));
            }
        });
        this.allFlavorTags = Array.from(tagsSet).sort();
        this.notify({ type: 'flavorTags', data: this.allFlavorTags });
    }

    extractAlcoholTags() {
        const tagsSet = new Set();
        this.cocktails.forEach(cocktail => {
            if (cocktail.alcohol && Array.isArray(cocktail.alcohol)) {
                cocktail.alcohol.forEach(tag => tagsSet.add(tag));
            }
        });
        this.allAlcoholTags = Array.from(tagsSet).sort();
        this.notify({ type: 'alcoholTags', data: this.allAlcoholTags });
    }
}

// Export singleton instance
const appState = new AppState();
export default appState;