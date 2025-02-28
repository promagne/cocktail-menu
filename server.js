const express = require('express');
const fs = require('fs');
const path = require('path');
const marked = require('marked');

const app = express();
const DEFAULT_PORT = 3000;

// Function to find an available port
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = require('net').createServer();
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try the next one
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
        
        server.listen(startPort, () => {
            server.close(() => {
                resolve(startPort);
            });
        });
    });
}

// Function to clean up existing data files
function cleanupDataFiles() {
    const dataFiles = [
        path.join(__dirname, 'recipes-data.json'),
        path.join(__dirname, 'categories-data.json')
    ];
    
    dataFiles.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
                console.log(`Deleted existing data file: ${file}`);
            } catch (error) {
                console.error(`Error deleting ${file}:`, error);
            }
        }
    });
}

// Extract YAML frontmatter from markdown content
function extractFrontmatter(content) {
    // Normalize line endings
    const normalizedContent = content.replace(/\r\n/g, '\n');
    
    // Match frontmatter section
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n\s*---/;
    const match = normalizedContent.match(frontmatterRegex);
    
    if (match && match[1]) {
        const frontmatterLines = match[1].split('\n');
        const frontmatter = {};
        
        frontmatterLines.forEach(line => {
            line = line.trim();
            if (!line) return; // Skip empty lines
            
            // Find the first colon to split key and value
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) return; // Skip if no colon found
            
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            if (!key) return; // Skip if no key
            
            // Handle arrays in YAML (like flavor: [sweet, bitter])
            if (value.startsWith('[') && value.endsWith(']')) {
                // Extract array items
                const arrayContent = value.substring(1, value.length - 1);
                if (arrayContent.trim()) {
                    // Split by comma and trim each item
                    frontmatter[key] = arrayContent.split(',').map(item => item.trim());
                } else {
                    frontmatter[key] = []; // Empty array
                }
            } else if (value === 'true') {
                frontmatter[key] = true;
            } else if (value === 'false') {
                frontmatter[key] = false;
            } else {
                frontmatter[key] = value;
            }
        });
        
        console.log(`Extracted frontmatter for file with flavor: ${JSON.stringify(frontmatter.flavor)}`);
        return frontmatter;
    }
    
    return {};
}

// Generate cocktail data
function generateCocktailData() {
    const recipesDir = path.join(__dirname, 'recipes');
    const cocktails = [];
    
    // Read all recipe files (excluding the By Alcohol directory)
    const files = fs.readdirSync(recipesDir)
        .filter(file => file !== 'By Alcohol' && file.endsWith('.md'));
    
    files.forEach(file => {
        const filePath = path.join(recipesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract frontmatter
        const frontmatter = extractFrontmatter(content);
        
        // Extract cocktail name (first heading)
        const nameMatch = content.match(/^# (.+)$/m);
        const name = nameMatch ? nameMatch[1] : file.replace('.md', '');
        
        // Determine alcohol types
        const alcoholTypes = determineAlcoholTypes(content, file);
        
        // Extract ingredients
        const ingredients = extractIngredients(content);
        
        cocktails.push({
            name,
            path: `recipes/${file}`,
            alcoholTypes,
            ingredients,
            flavor: frontmatter.flavor || [],
            available: frontmatter.available !== undefined ? frontmatter.available : true,
            favorite: frontmatter.favorite || false
        });
    });
    
    // Write to JSON file
    fs.writeFileSync(
        path.join(__dirname, 'recipes-data.json'),
        JSON.stringify(cocktails, null, 2)
    );
    
    return cocktails;
}

// Extract ingredients from cocktail content
function extractIngredients(content) {
    const ingredientsMatch = content.match(/## Ingredients:([^#]+)/s) || 
                            content.match(/## Ingredients([^#]+)/s);
    if (!ingredientsMatch) return [];
    
    const ingredientsSection = ingredientsMatch[1].trim();
    const ingredientLines = ingredientsSection.split('\n');
    
    return ingredientLines
        .filter(line => line.trim().startsWith('-'))
        .map(line => {
            // Remove the leading dash and trim
            let ingredient = line.trim().substring(1).trim();
            
            // Remove markdown formatting like **2 ounces** or *2 ounces*
            ingredient = ingredient.replace(/\*\*([^*]+)\*\*/g, '$1');
            ingredient = ingredient.replace(/\*([^*]+)\*/g, '$1');
            
            // Handle "Garnish: something" format
            if (ingredient.toLowerCase().startsWith('garnish:')) {
                return 'Garnish';
            }
            
            // Handle "Ice cubes" and similar non-measured ingredients
            if (/^ice\s+/i.test(ingredient)) {
                return 'Ice';
            }
            
            // Remove parenthetical expressions like "(Maker's Mark recommended)"
            ingredient = ingredient.replace(/\s*\([^)]*\)/g, '');
            
            // Remove quantities with various units
            // This handles formats like:
            // - "1½ oz Larceny bourbon"
            // - "¾ oz Carpano Antica sweet vermouth"
            // - "1 dash Regans' Orange Bitters"
            ingredient = ingredient.replace(/^(?:[0-9½¼¾\.\/]+\s*(?:-\s*[0-9½¼¾\.\/]+)?\s*(?:oz|ounce|ounces|dash|dashes|bar spoon|spoon|teaspoon|tablespoon|cup|part|parts|ml|cl|shot|shots|splash|spritz|slice|slices|leaves|sprig|piece|pieces|drops|drop|bottle|bottles|can|cans|pinch|wedge|wedges|twist|twists|peel|peels)s?\.?\s*)+/i, '');
            
            // Remove any remaining numbers at the beginning (like "2 lemons")
            ingredient = ingredient.replace(/^[0-9½¼¾\.\/]+\s+/, '');
            
            // Remove "to taste", "to garnish", etc.
            ingredient = ingredient.replace(/\s+to\s+(?:taste|garnish|top|serve|rim).*$/i, '');
            
            // Remove any remaining colons and text after them (like "Orange bitters: optional")
            const colonIndex = ingredient.indexOf(':');
            if (colonIndex > 0) {
                ingredient = ingredient.substring(0, colonIndex);
            }
            
            // Remove "for" phrases (like "for garnish")
            ingredient = ingredient.replace(/\s+for\s+(?:garnish|rimming|the rim|the glass).*$/i, '');
            
            // Remove any remaining parenthetical expressions
            ingredient = ingredient.replace(/\s*\([^)]*\)/g, '');
            
            // Trim again to remove any extra spaces
            ingredient = ingredient.trim();
            
            // If the ingredient is empty after all this processing, return null
            // This will be filtered out in the next step
            return ingredient.length > 0 ? ingredient : null;
        })
        // Filter out null values
        .filter(ingredient => ingredient !== null);
}

// Determine alcohol types for a cocktail
function determineAlcoholTypes(content, filename) {
    const alcoholTypes = [];
    const alcoholKeywords = [
        'Bourbon', 'Rye', 'Whisky', 'Whiskey', 'Scotch', 'Gin', 'Vodka',
        'Rum', 'Cognac', 'Brandy', 'Calvados', 'Vermouth', 'Prosecco',
        'Champagne', 'Wine', 'Chartreuse', 'Campari', 'Amaro', 'Aperol',
        'Absinthe', 'Tequila', 'Mezcal'
    ];
    
    // Check ingredients section for alcohol types
    const ingredientsMatch = content.match(/## Ingredients:([^#]+)/s);
    if (ingredientsMatch) {
        const ingredients = ingredientsMatch[1];
        alcoholKeywords.forEach(alcohol => {
            if (ingredients.includes(alcohol.toLowerCase()) || 
                ingredients.includes(alcohol)) {
                alcoholTypes.push(alcohol);
            }
        });
    }
    
    // If no alcohol types found, check the By Alcohol directory
    if (alcoholTypes.length === 0) {
        const byAlcoholDir = path.join(__dirname, 'recipes', 'By Alcohol');
        const categoryFiles = fs.readdirSync(byAlcoholDir)
            .filter(file => file.endsWith('.md') && file !== '_Index.md');
        
        categoryFiles.forEach(categoryFile => {
            const categoryContent = fs.readFileSync(
                path.join(byAlcoholDir, categoryFile), 
                'utf8'
            );
            
            // Check if this cocktail is listed in the category
            const cocktailName = filename.replace('.md', '');
            if (categoryContent.includes(`[[${cocktailName}]]`)) {
                const categoryName = categoryFile.replace('.md', '');
                alcoholTypes.push(categoryName);
            }
        });
    }
    
    return alcoholTypes.length > 0 ? alcoholTypes : ['Unknown'];
}

// Generate category data
function generateCategoryData() {
    const byAlcoholDir = path.join(__dirname, 'recipes', 'By Alcohol');
    const categories = [];
    
    const files = fs.readdirSync(byAlcoholDir)
        .filter(file => file.endsWith('.md') && file !== '_Index.md');
    
    files.forEach(file => {
        const filePath = path.join(byAlcoholDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract category name (first heading)
        const nameMatch = content.match(/^# (.+) Cocktails$/m);
        const name = nameMatch ? nameMatch[1] : file.replace('.md', '');
        
        // Extract description
        const descMatch = content.match(/Cocktails\n\n([^#]+)/);
        const description = descMatch ? descMatch[1].trim() : '';
        
        categories.push({
            name,
            description,
            path: `recipes/By Alcohol/${file}`
        });
    });
    
    // Write to JSON file
    fs.writeFileSync(
        path.join(__dirname, 'categories-data.json'),
        JSON.stringify(categories, null, 2)
    );
    
    return categories;
}

// Serve static files
app.use(express.static(__dirname));

// API endpoint to get cocktails data
app.get('/api/cocktails', (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'recipes-data.json');
        if (fs.existsSync(dataPath)) {
            const cocktailsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            res.json(cocktailsData);
        } else {
            const cocktails = generateCocktailData();
            res.json(cocktails);
        }
    } catch (error) {
        console.error('Error fetching cocktails data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate data files on server start
app.get('/generate-data', (req, res) => {
    try {
        cleanupDataFiles();
        const cocktails = generateCocktailData();
        const categories = generateCategoryData();
        res.json({
            success: true,
            cocktailCount: cocktails.length,
            categoryCount: categories.length
        });
    } catch (error) {
        console.error('Error generating data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
findAvailablePort(DEFAULT_PORT).then(PORT => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log('Generating data files...');
        cleanupDataFiles();
        generateCocktailData();
        generateCategoryData();
        console.log('Data files generated!');
    });
});
