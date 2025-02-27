document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const cocktailsGrid = document.getElementById('cocktailsGrid');
    const alcoholCategories = document.getElementById('alcoholCategories');
    const categoryCocktails = document.getElementById('categoryCocktails');
    const searchInput = document.getElementById('searchInput');
    const cocktailModal = document.getElementById('cocktailModal');
    const cocktailDetail = document.getElementById('cocktailDetail');
    const closeModal = document.querySelector('.close-modal');

    // State
    let cocktails = [];
    let categories = [];
    let selectedCategory = null;

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

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterCocktails(searchTerm);
    });

    // Filter cocktails based on search term
    function filterCocktails(searchTerm) {
        const filteredCocktails = cocktails.filter(cocktail => 
            cocktail.name.toLowerCase().includes(searchTerm)
        );
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
        cocktailsToRender.forEach(cocktail => {
            const card = document.createElement('div');
            card.className = 'cocktail-card';
            
            // Limit to 4 ingredients
            const displayIngredients = cocktail.ingredients.slice(0, 4);
            const hasMoreIngredients = cocktail.ingredients.length > 4;
            
            card.innerHTML = `
                <h3>${cocktail.name}</h3>
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
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.textContent = category.name;
            button.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(btn => 
                    btn.classList.remove('active')
                );
                button.classList.add('active');
                selectedCategory = category;
                renderCategoryCocktails(category);
            });
            alcoholCategories.appendChild(button);
        });
    }

    // Render cocktails for selected category
    function renderCategoryCocktails(category) {
        categoryCocktails.innerHTML = '';
        
        // Get cocktails for this category
        const categoryCocktailsList = cocktails.filter(cocktail => 
            cocktail.alcoholTypes.includes(category.name)
        );
        
        categoryCocktailsList.forEach(cocktail => {
            const card = document.createElement('div');
            card.className = 'cocktail-card';
            
            // Limit to 4 ingredients
            const displayIngredients = cocktail.ingredients.slice(0, 4);
            const hasMoreIngredients = cocktail.ingredients.length > 4;
            
            card.innerHTML = `
                <h3>${cocktail.name}</h3>
                <div class="ingredients-list">
                    ${displayIngredients.map(ingredient => `<span class="ingredient">${ingredient}</span>`).join('')}
                    ${hasMoreIngredients ? '<span class="ingredient more">+more</span>' : ''}
                </div>
            `;
            card.addEventListener('click', () => showCocktailDetail(cocktail));
            categoryCocktails.appendChild(card);
        });
    }

    // Show cocktail detail in modal
    async function showCocktailDetail(cocktail) {
        try {
            const response = await fetch(cocktail.path);
            if (!response.ok) {
                throw new Error('Failed to fetch cocktail details');
            }
            const markdown = await response.text();
            cocktailDetail.innerHTML = marked.parse(markdown);
            cocktailModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching cocktail details:', error);
        }
    }

    // Generate cocktail and category data JSON files
    async function generateDataFiles() {
        try {
            // This is a placeholder for server-side processing
            // In a real implementation, this would be done by a server script
            console.log('Data files would be generated server-side');
        } catch (error) {
            console.error('Error generating data files:', error);
        }
    }

    // Initialize the application
    async function init() {
        // In a real implementation, these would be generated server-side
        // For now, we'll use placeholder data for demonstration
        await generateDataFiles();
        
        cocktails = await fetchCocktails();
        categories = await fetchCategories();
        
        renderCocktailsGrid(cocktails);
        renderAlcoholCategories();
        
        // Select first category by default
        if (categories.length > 0) {
            const firstCategoryBtn = document.querySelector('.category-btn');
            if (firstCategoryBtn) {
                firstCategoryBtn.classList.add('active');
                selectedCategory = categories[0];
                renderCategoryCocktails(categories[0]);
            }
        }
    }

    // Start the app
    init();
});
