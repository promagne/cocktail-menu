# Cocktail Menu

A web-based cocktail menu that displays recipes from markdown files. The website follows the same look and style as the compreview-analyzer project.

## Features

- View all cocktail recipes in a grid layout
- Filter cocktails by alcohol type
- Search for specific cocktails
- View detailed recipe information in a modal
- Dark mode toggle

## Project Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styling
- `app.js` - Frontend JavaScript
- `server.js` - Node.js server for generating data files and serving the website
- `recipes/` - Directory containing all cocktail recipes in markdown format
- `recipes/By Alcohol/` - Directory containing categorized cocktail lists by alcohol type

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How It Works

The application reads markdown files from the `recipes` directory and generates JSON data files that are used by the frontend to display the cocktail menu. The server automatically generates these data files when it starts.

- `recipes-data.json` - Contains information about all cocktails
- `categories-data.json` - Contains information about alcohol categories

## Customization

To add new cocktail recipes, simply add new markdown files to the `recipes` directory following the same format as the existing files. The server will automatically detect and include them in the menu.

## Technologies Used

- HTML, CSS, JavaScript
- Node.js with Express
- Marked.js for Markdown parsing
