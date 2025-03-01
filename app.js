document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cocktailsGrid = document.getElementById('cocktailsGrid');
    const searchInput = document.getElementById('searchInput');
    const availabilityTags = document.getElementById('availabilityTags');
    const favoriteTags = document.getElementById('favoriteTags');
    const flavorTagsContainer = document.getElementById('flavorTags');
    const alcoholTagsContainer = document.getElementById('alcoholTags');
    const cocktailModal = document.getElementById('cocktailModal');
    const cocktailDetail = document.getElementById('cocktailDetail');
    const closeModal = document.querySelector('.close-modal');

    // State
    let cocktails = [];
    let activeFlavorTags = [];
    let allFlavorTags = [];
    let activeAlcoholTags = [];
    let allAlcoholTags = [];
    let activeAvailabilityTag = 'all';
    let activeFavoriteTag = 'all';

    // Close Modal
    closeModal.addEventListener('click', function() {
        cocktailModal.style.display = 'none';
    });

    // Close Modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === cocktailModal) {
            cocktailModal.style.display = 'none';
        }
    });

    // Render cocktails in the grid
    function renderCocktails() {
        cocktailsGrid.innerHTML = '';
        
        // Filter cocktails based on search, availability, favorites, flavor tags, and alcohol tags
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredCocktails = cocktails.filter(cocktail => {
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
        
        if (filteredCocktails.length === 0) {
            cocktailsGrid.innerHTML = '<div class="no-results">No cocktails match your filters</div>';
            return;
        }
        
        filteredCocktails.forEach(cocktail => {
            const card = createCocktailCard(cocktail);
            cocktailsGrid.appendChild(card);
        });
    }

    // Create a cocktail card
    function createCocktailCard(cocktail) {
        const card = document.createElement('div');
        card.className = 'cocktail-card';
        
        // Add status indicators (available/favorite)
        let statusIndicators = '';
        if (!cocktail.available) {
            statusIndicators += '<span class="status-indicator unavailable">✕</span>';
        }
        if (cocktail.favorite) {
            statusIndicators += '<span class="status-indicator favorite">★</span>';
        }
        
        // Add flavor tags if present
        let flavorTags = '';
        if (cocktail.flavor && Array.isArray(cocktail.flavor) && cocktail.flavor.length > 0) {
            flavorTags = `
                <div class="card-tag-list">
                    ${cocktail.flavor.map(flavor => `<span class="card-tag card-tag--flavor">${flavor}</span>`).join('')}
                </div>
            `;
        }
        
        // Limit to 4 ingredients
        const ingredients = Array.isArray(cocktail.ingredients) ? cocktail.ingredients : [];
        const displayIngredients = ingredients.slice(0, 4);
        const hasMoreIngredients = ingredients.length > 4;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${cocktail.name}</h3>
                ${statusIndicators}
            </div>
            ${flavorTags}
            <div class="ingredients-list">
                ${displayIngredients.map(ingredient => `<span class="ingredient">${ingredient}</span>`).join('')}
                ${hasMoreIngredients ? '<span class="ingredient more">+more</span>' : ''}
            </div>
        `;
        
        // Add click event to show detail
        card.addEventListener('click', function() {
            showCocktailDetail(cocktail);
        });
        
        return card;
    }

    // Show cocktail detail in modal
    function showCocktailDetail(cocktail) {
        // Fetch the recipe markdown
        fetch(cocktail.path)
            .then(response => response.text())
            .then(markdown => {
                // Remove frontmatter
                const contentWithoutFrontmatter = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
                
                // Convert markdown to HTML
                const html = marked.parse(contentWithoutFrontmatter);
                
                // Add availability and favorite indicators
                let statusIndicators = '<div class="status-indicators">';
                if (!cocktail.available) {
                    statusIndicators += '<span class="unavailable-indicator">✕</span>';
                }
                if (cocktail.favorite) {
                    statusIndicators += '<span class="favorite-indicator">★</span>';
                }
                statusIndicators += '</div>';
                
                // Add flavor tags if any
                let flavorTags = '';
                if (cocktail.flavor && Array.isArray(cocktail.flavor) && cocktail.flavor.length > 0) {
                    flavorTags = `
                        <div class="detail-tags">
                            ${cocktail.flavor.map(flavor => `<span class="detail-tag detail-tag--flavor">${flavor}</span>`).join('')}
                        </div>
                    `;
                }
                
                // Add alcohol tags if any
                let alcoholTags = '';
                if (cocktail.alcohol && Array.isArray(cocktail.alcohol) && cocktail.alcohol.length > 0) {
                    alcoholTags = `
                        <div class="detail-tags">
                            ${cocktail.alcohol.map(alcohol => `<span class="detail-tag detail-tag--alcohol">${alcohol}</span>`).join('')}
                        </div>
                    `;
                }
                
                cocktailDetail.innerHTML = `
                    <div class="detail-header">
                        <h2>${cocktail.name}</h2>
                        ${statusIndicators}
                    </div>
                    ${flavorTags}
                    ${alcoholTags}
                    <div class="detail-content">${html}</div>
                `;
                
                cocktailModal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching recipe:', error);
                cocktailDetail.innerHTML = `<p>Error loading recipe for ${cocktail.name}</p>`;
                cocktailModal.style.display = 'block';
            });
    }

    // Extract all unique flavor tags from cocktails
    function extractFlavorTags() {
        const tagsSet = new Set();
        cocktails.forEach(cocktail => {
            if (cocktail.flavor && Array.isArray(cocktail.flavor)) {
                cocktail.flavor.forEach(tag => tagsSet.add(tag));
            }
        });
        allFlavorTags = Array.from(tagsSet).sort();
    }
    
    // Extract all unique alcohol types from cocktails
    function extractAlcoholTags() {
        const tagsSet = new Set();
        cocktails.forEach(cocktail => {
            if (cocktail.alcohol && Array.isArray(cocktail.alcohol)) {
                cocktail.alcohol.forEach(tag => tagsSet.add(tag));
            }
        });
        allAlcoholTags = Array.from(tagsSet).sort();
    }
    
    // Render flavor tags for filtering
    function renderFlavorTags() {
        flavorTagsContainer.innerHTML = '';
        
        if (allFlavorTags.length === 0) {
            flavorTagsContainer.innerHTML = '<div class="no-tags">No flavor tags available</div>';
            return;
        }
        
        allFlavorTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'filter-tag filter-tag--flavor';
            tagEl.textContent = tag;
            
            if (activeFlavorTags.includes(tag)) {
                tagEl.classList.add('active');
            }
            
            tagEl.addEventListener('click', function() {
                if (activeFlavorTags.includes(tag)) {
                    // Remove tag from active tags
                    activeFlavorTags = activeFlavorTags.filter(t => t !== tag);
                    tagEl.classList.remove('active');
                } else {
                    // Add tag to active tags
                    activeFlavorTags.push(tag);
                    tagEl.classList.add('active');
                }
                
                renderCocktails();
            });
            
            flavorTagsContainer.appendChild(tagEl);
        });
    }
    
    // Render alcohol tags for filtering
    function renderAlcoholTags() {
        alcoholTagsContainer.innerHTML = '';
        
        if (allAlcoholTags.length === 0) {
            alcoholTagsContainer.innerHTML = '<div class="no-tags">No alcohol types available</div>';
            return;
        }
        
        allAlcoholTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'filter-tag filter-tag--alcohol';
            tagEl.textContent = tag;
            
            if (activeAlcoholTags.includes(tag)) {
                tagEl.classList.add('active');
            }
            
            tagEl.addEventListener('click', function() {
                if (activeAlcoholTags.includes(tag)) {
                    // Remove tag from active tags
                    activeAlcoholTags = activeAlcoholTags.filter(t => t !== tag);
                    tagEl.classList.remove('active');
                } else {
                    // Add tag to active tags
                    activeAlcoholTags.push(tag);
                    tagEl.classList.add('active');
                }
                
                renderCocktails();
            });
            
            alcoholTagsContainer.appendChild(tagEl);
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Search input
        searchInput.addEventListener('input', renderCocktails);
        
        // Availability tags
        const availabilityTagElements = availabilityTags.querySelectorAll('.filter-tag--availability');
        availabilityTagElements.forEach(tag => {
            tag.addEventListener('click', function() {
                // Remove active class from all tags
                availabilityTagElements.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tag
                this.classList.add('active');
                
                // Update active tag
                activeAvailabilityTag = this.getAttribute('data-value');
                
                // Re-render cocktails
                renderCocktails();
            });
        });
        
        // Favorite tags
        const favoriteTagElements = favoriteTags.querySelectorAll('.filter-tag--favorite');
        favoriteTagElements.forEach(tag => {
            tag.addEventListener('click', function() {
                // Remove active class from all tags
                favoriteTagElements.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tag
                this.classList.add('active');
                
                // Update active tag
                activeFavoriteTag = this.getAttribute('data-value');
                
                // Re-render cocktails
                renderCocktails();
            });
        });
        
        // Set up toggle functionality for all filter groups
        setupFilterToggle('toggleAvailability', '.filter-group--availability');
        setupFilterToggle('toggleFavorites', '.filter-group--favorite');
        setupFilterToggle('toggleFlavor', '.filter-group--flavor');
        setupFilterToggle('toggleAlcohol', '.filter-group--alcohol');
    }
    
    // Helper function to set up filter toggle
    function setupFilterToggle(buttonId, groupSelector) {
        const toggleButton = document.getElementById(buttonId);
        const filterGroup = document.querySelector(groupSelector);
        
        if (toggleButton && filterGroup) {
            // Set initial button text based on collapsed state
            toggleButton.textContent = filterGroup.classList.contains('collapsed') ? '▶' : '▼';
            
            // Make the toggle button clickable
            toggleButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering the header click
                toggleFilterGroup(filterGroup, toggleButton);
            });
            
            // Make the entire header clickable
            const groupHeader = filterGroup.querySelector('.group-header');
            if (groupHeader) {
                groupHeader.style.cursor = 'pointer';
                groupHeader.addEventListener('click', function() {
                    toggleFilterGroup(filterGroup, toggleButton);
                });
            }
        }
    }
    
    // Helper function to toggle filter group state
    function toggleFilterGroup(filterGroup, toggleButton) {
        filterGroup.classList.toggle('collapsed');
        toggleButton.textContent = filterGroup.classList.contains('collapsed') ? '▶' : '▼';
    }

    // Initialize the application
    function init() {
        console.log('Fetching cocktails data...');
        
        // Try the API endpoint first
        fetch('/api/cocktails')
            .then(response => {
                console.log('API response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Cocktails data received from API:', data.length, 'cocktails');
                cocktails = data;
                renderCocktails();
                extractFlavorTags();
                renderFlavorTags();
                extractAlcoholTags();
                renderAlcoholTags();
                setupEventListeners();
            })
            .catch(error => {
                console.error('Error fetching cocktails from API:', error);
                
                // Fallback: try to load the data file directly
                console.log('Trying fallback: loading recipes-data.json directly...');
                fetch('/recipes-data.json')
                    .then(response => {
                        console.log('Fallback response status:', response.status);
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Cocktails data received from fallback:', data.length, 'cocktails');
                        cocktails = data;
                        renderCocktails();
                        extractFlavorTags();
                        renderFlavorTags();
                        extractAlcoholTags();
                        renderAlcoholTags();
                        setupEventListeners();
                    })
                    .catch(fallbackError => {
                        console.error('Error fetching cocktails from fallback:', fallbackError);
                        cocktailsGrid.innerHTML = '<div class="no-results">Error loading cocktails. Please try again later.</div>';
                    });
            });
    }

    // Start the app
    init();
});
