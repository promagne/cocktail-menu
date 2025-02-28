document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const cocktailsGrid = document.getElementById('cocktailsGrid');
    const searchInput = document.getElementById('searchInput');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const favoriteFilter = document.getElementById('favoriteFilter');
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

    // Theme Toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        updateThemeButtonText();
    });

    // Set dark mode by default or check for saved preference
    if (localStorage.getItem('darkMode') === null) {
        // No preference saved, set dark mode by default
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else if (localStorage.getItem('darkMode') === 'true') {
        // User previously selected dark mode
        document.body.classList.add('dark-mode');
    }
    
    // Update theme button text based on current mode
    function updateThemeButtonText() {
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = 'Switch to Light Mode';
        } else {
            themeToggle.textContent = 'Switch to Dark Mode';
        }
    }
    
    // Initialize theme button text
    updateThemeButtonText();

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
        const availabilityValue = availabilityFilter.value;
        const favoriteValue = favoriteFilter.value;
        
        const filteredCocktails = cocktails.filter(cocktail => {
            // Search filter
            const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm);
            
            // Availability filter
            const matchesAvailability = 
                availabilityValue === 'all' || 
                (availabilityValue === 'available' && cocktail.available) || 
                (availabilityValue === 'unavailable' && !cocktail.available);
            
            // Favorite filter
            const matchesFavorite = 
                favoriteValue === 'all' || 
                (favoriteValue === 'favorite' && cocktail.favorite);
            
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
        if (cocktail.flavor && cocktail.flavor.length > 0) {
            flavorTags = `
                <div class="card-flavor-tags">
                    ${cocktail.flavor.map(flavor => `<span class="card-flavor-tag">${flavor}</span>`).join('')}
                </div>
            `;
        }
        
        // Add alcohol tags if any
        let alcoholTags = '';
        if (cocktail.alcohol && cocktail.alcohol.length > 0) {
            alcoholTags = `
                <div class="card-alcohol-tags">
                    ${cocktail.alcohol.map(alcohol => `<span class="card-alcohol-tag">${alcohol}</span>`).join('')}
                </div>
            `;
        }
        
        // Limit to 4 ingredients
        const displayIngredients = cocktail.ingredients.slice(0, 4);
        const hasMoreIngredients = cocktail.ingredients.length > 4;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${cocktail.name}</h3>
                ${statusIndicators}
            </div>
            ${flavorTags}
            ${alcoholTags}
            <div class="ingredients-list">
                ${displayIngredients.map(ingredient => `<span class="ingredient">${ingredient}</span>`).join('')}
                ${hasMoreIngredients ? '<span class="ingredient more">+more</span>' : ''}
            </div>
        `;
        card.addEventListener('click', () => showCocktailDetail(cocktail));
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
                if (cocktail.flavor && cocktail.flavor.length > 0) {
                    flavorTags = `
                        <div class="detail-flavor-tags">
                            ${cocktail.flavor.map(flavor => `<span class="detail-flavor-tag">${flavor}</span>`).join('')}
                        </div>
                    `;
                }
                
                // Add alcohol tags if any
                let alcoholTags = '';
                if (cocktail.alcohol && cocktail.alcohol.length > 0) {
                    alcoholTags = `
                        <div class="detail-alcohol-tags">
                            ${cocktail.alcohol.map(alcohol => `<span class="detail-alcohol-tag">${alcohol}</span>`).join('')}
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
            tagEl.className = 'tag';
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
            tagEl.className = 'tag';
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
                    })
                    .catch(fallbackError => {
                        console.error('Error fetching cocktails from fallback:', fallbackError);
                        cocktailsGrid.innerHTML = '<div class="no-results">Error loading cocktails. Please try again later.</div>';
                    });
            });
        
        // Add event listeners for filters
        searchInput.addEventListener('input', renderCocktails);
        availabilityFilter.addEventListener('change', renderCocktails);
        favoriteFilter.addEventListener('change', renderCocktails);
    }

    // Start the app
    init();
});
