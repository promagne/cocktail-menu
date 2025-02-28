document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const cocktailsGrid = document.getElementById('cocktailsGrid');
    const alcoholCategories = document.getElementById('alcoholCategories');
    const categoryCocktails = document.getElementById('categoryCocktails');
    const searchInput = document.getElementById('searchInput');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const favoriteFilter = document.getElementById('favoriteFilter');
    const flavorTagsContainer = document.getElementById('flavorTags');
    const cocktailModal = document.getElementById('cocktailModal');
    const cocktailDetail = document.getElementById('cocktailDetail');
    const closeModal = document.querySelector('.close-modal');

    // State
    let cocktails = [];
    let categories = [];
    let selectedCategory = null;
    let activeFlavorTags = [];
    let allFlavorTags = [];

    // Theme Toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

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

    // Filter cocktails based on search term and filters
    function filterCocktails() {
        const searchTerm = searchInput.value.toLowerCase();
        const availabilityValue = availabilityFilter.value;
        const favoriteValue = favoriteFilter.value;
        
        const filteredCocktails = cocktails.filter(cocktail => {
            // Search term filter
            const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm);
            
            // Availability filter
            let matchesAvailability = true;
            if (availabilityValue === 'available') {
                matchesAvailability = cocktail.available === true;
            } else if (availabilityValue === 'unavailable') {
                matchesAvailability = cocktail.available === false;
            }
            
            // Favorite filter
            let matchesFavorite = true;
            if (favoriteValue === 'favorite') {
                matchesFavorite = cocktail.favorite === true;
            }
            
            // Flavor tags filter
            let matchesFlavorTags = true;
            if (activeFlavorTags.length > 0) {
                matchesFlavorTags = activeFlavorTags.every(tag => 
                    cocktail.flavor && cocktail.flavor.includes(tag)
                );
            }
            
            return matchesSearch && matchesAvailability && matchesFavorite && matchesFlavorTags;
        });
        
        renderCocktailsGrid(filteredCocktails);
    }

    // Fetch all recipe files
    async function fetchCocktails() {
        try {
            const response = await fetch('recipes-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch cocktail data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching cocktails:', error);
            return [];
        }
    }

    // Fetch categories
    async function fetchCategories() {
        try {
            const response = await fetch('categories-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch category data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Render cocktails grid
    function renderCocktailsGrid(cocktailsToRender) {
        cocktailsGrid.innerHTML = '';
        
        if (cocktailsToRender.length === 0) {
            cocktailsGrid.innerHTML = '<div class="no-results">No cocktails match your filters</div>';
            return;
        }
        
        cocktailsToRender.forEach(cocktail => {
            const card = document.createElement('div');
            card.className = 'cocktail-card';
            
            // Add availability and favorite indicators
            let statusIndicators = '';
            if (!cocktail.available) {
                statusIndicators += '<span class="status-indicator unavailable">Unavailable</span>';
            }
            if (cocktail.favorite) {
                statusIndicators += '<span class="status-indicator favorite">★</span>';
            }
            
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
                    <div class="status-indicators">${statusIndicators}</div>
                </div>
                ${flavorTags}
                <div class="ingredients-list">
                    ${displayIngredients.map(ingredient => `<span class="ingredient">${ingredient}</span>`).join('')}
                    ${hasMoreIngredients ? '<span class="ingredient more">+more</span>' : ''}
                </div>
            `;
            card.addEventListener('click', () => showCocktailDetail(cocktail));
            cocktailsGrid.appendChild(card);
        });
    }

    // Render alcohol categories
    function renderAlcoholCategories() {
        alcoholCategories.innerHTML = '';
        categories.forEach(category => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'alcohol-category';
            categoryEl.textContent = category.name;
            categoryEl.addEventListener('click', () => {
                // Remove active class from all categories
                document.querySelectorAll('.alcohol-category').forEach(el => {
                    el.classList.remove('active');
                });
                
                // Add active class to clicked category
                categoryEl.classList.add('active');
                selectedCategory = category;
                renderCategoryCocktails(category);
            });
            alcoholCategories.appendChild(categoryEl);
        });
    }

    // Render cocktails for selected category
    function renderCategoryCocktails(category) {
        categoryCocktails.innerHTML = '';
        
        // Filter cocktails by selected category
        const filteredCocktails = cocktails.filter(cocktail => 
            cocktail.alcoholTypes.includes(category.name)
        );
        
        if (filteredCocktails.length === 0) {
            categoryCocktails.innerHTML = `<div class="no-results">No cocktails found for ${category.name}</div>`;
            return;
        }
        
        filteredCocktails.forEach(cocktail => {
            const cocktailEl = document.createElement('div');
            cocktailEl.className = 'category-cocktail';
            
            // Add availability and favorite indicators
            let statusIndicators = '';
            if (!cocktail.available) {
                statusIndicators += '<span class="status-indicator unavailable">Unavailable</span>';
            }
            if (cocktail.favorite) {
                statusIndicators += '<span class="status-indicator favorite">★</span>';
            }
            
            cocktailEl.innerHTML = `
                <div class="cocktail-name">${cocktail.name}</div>
                <div class="status-indicators">${statusIndicators}</div>
            `;
            
            cocktailEl.addEventListener('click', () => showCocktailDetail(cocktail));
            categoryCocktails.appendChild(cocktailEl);
        });
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
                let statusIndicators = '';
                if (!cocktail.available) {
                    statusIndicators += '<span class="status-indicator unavailable">Unavailable</span>';
                }
                if (cocktail.favorite) {
                    statusIndicators += '<span class="status-indicator favorite">★</span>';
                }
                
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
                        <div class="status-indicators">${statusIndicators}</div>
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
                filterCocktails();
            });
            
            flavorTagsContainer.appendChild(tagEl);
        });
    }

    // Initialize the application
    async function init() {
        // Fetch cocktails and categories
        cocktails = await fetchCocktails();
        categories = await fetchCategories();
        
        // Extract flavor tags
        extractFlavorTags();
        
        // Render cocktails and categories
        renderCocktailsGrid(cocktails);
        renderAlcoholCategories();
        
        // Add event listeners for filters
        searchInput.addEventListener('input', filterCocktails);
        availabilityFilter.addEventListener('change', filterCocktails);
        favoriteFilter.addEventListener('change', filterCocktails);
    }

    // Start the app
    init();
});
