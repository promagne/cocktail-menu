document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const cocktailsGrid = document.getElementById('cocktailsGrid');
    const searchInput = document.getElementById('searchInput');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const favoriteFilter = document.getElementById('favoriteFilter');
    const flavorTagsContainer = document.getElementById('flavorTags');
    const cocktailModal = document.getElementById('cocktailModal');
    const cocktailDetail = document.getElementById('cocktailDetail');
    const closeModal = document.querySelector('.close-modal');

    // State
    let cocktails = [];
    let activeFlavorTags = [];
    let allFlavorTags = [];

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
        
        // Filter cocktails based on search, availability, favorites, and flavor tags
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
            
            return matchesSearch && matchesAvailability && matchesFavorite && matchesFlavorTags;
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
        
        // Limit to 4 ingredients
        const displayIngredients = cocktail.ingredients.slice(0, 4);
        const hasMoreIngredients = cocktail.ingredients.length > 4;
        
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
                
                cocktailDetail.innerHTML = `
                    <div class="detail-header">
                        <h2>${cocktail.name}</h2>
                        ${statusIndicators}
                    </div>
                    ${flavorTags}
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
        const tags = new Set();
        
        cocktails.forEach(cocktail => {
            if (cocktail.flavor && Array.isArray(cocktail.flavor)) {
                cocktail.flavor.forEach(tag => tags.add(tag));
            }
        });
        
        allFlavorTags = Array.from(tags).sort();
        renderFlavorTags();
    }
    
    // Render flavor tags for filtering
    function renderFlavorTags() {
        flavorTagsContainer.innerHTML = '';
        
        if (allFlavorTags.length === 0) {
            flavorTagsContainer.innerHTML = '<span class="no-tags">No flavor tags available</span>';
            return;
        }
        
        allFlavorTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'flavor-tag';
            tagEl.textContent = tag;
            
            if (activeFlavorTags.includes(tag)) {
                tagEl.classList.add('active');
            }
            
            tagEl.addEventListener('click', () => {
                // Toggle active state
                if (activeFlavorTags.includes(tag)) {
                    activeFlavorTags = activeFlavorTags.filter(t => t !== tag);
                    tagEl.classList.remove('active');
                } else {
                    activeFlavorTags.push(tag);
                    tagEl.classList.add('active');
                }
                
                // Apply filters
                renderCocktails();
            });
            
            flavorTagsContainer.appendChild(tagEl);
        });
    }

    // Initialize the application
    function init() {
        // Fetch cocktails data
        fetch('./api/cocktails')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                cocktails = data;
                renderCocktails();
                extractFlavorTags();
                renderFlavorTags();
            })
            .catch(error => {
                console.error('Error fetching cocktails:', error);
                cocktailsGrid.innerHTML = '<div class="no-results">Error loading cocktails. Please try again later.</div>';
            });
        
        // Add event listeners for filters
        searchInput.addEventListener('input', renderCocktails);
        availabilityFilter.addEventListener('change', renderCocktails);
        favoriteFilter.addEventListener('change', renderCocktails);
    }

    // Start the app
    init();
});
