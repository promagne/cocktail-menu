const fs = require('fs');
const path = require('path');

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
        
        return frontmatter;
    }
    
    return {};
}

// Test with specific files
const filesToTest = [
    'Tailspin.md',
    'Strawberry Negroni.md',
    'Brandy Crusta.md'
];

filesToTest.forEach(file => {
    const filePath = path.join(__dirname, 'recipes', file);
    
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        console.log(`\n--- ${file} ---`);
        console.log('Frontmatter:', JSON.stringify(frontmatter, null, 2));
        console.log('Flavor tags:', frontmatter.flavor);
        
        // Debug raw content
        console.log('First 10 chars:', Buffer.from(content.substring(0, 10)).toString('hex'));
        console.log('Has BOM:', content.charCodeAt(0) === 0xFEFF);
    } else {
        console.log(`\n--- ${file} ---`);
        console.log('File not found');
    }
});
