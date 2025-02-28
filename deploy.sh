#!/bin/bash

# Cocktail Menu Deployment Script
# This script helps manage the cocktail-menu application

# Function to display usage information
show_usage() {
  echo "Usage: ./deploy.sh [command]"
  echo "Commands:"
  echo "  start    - Start the application"
  echo "  stop     - Stop the application"
  echo "  restart  - Restart the application"
  echo "  update   - Pull latest changes and restart"
  echo "  status   - Check application status"
  echo "  logs     - View application logs"
  echo "  regenerate - Regenerate data files"
}

# Check if PM2 is installed
check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing now..."
    npm install -g pm2
  fi
}

# Start the application
start_app() {
  check_pm2
  echo "Starting cocktail-menu application..."
  
  # Check if app is already running
  if pm2 list | grep -q "cocktail-menu"; then
    echo "Application is already running. Use 'restart' instead."
    exit 1
  fi
  
  # Start the application with PM2
  PORT=3000 pm2 start server.js --name "cocktail-menu"
  echo "Application started. Access at http://$(hostname -I | awk '{print $1}'):3000"
}

# Stop the application
stop_app() {
  check_pm2
  echo "Stopping cocktail-menu application..."
  pm2 stop cocktail-menu
  echo "Application stopped."
}

# Restart the application
restart_app() {
  check_pm2
  echo "Restarting cocktail-menu application..."
  
  # Delete data files to force regeneration
  echo "Cleaning up data files..."
  rm -f recipes-data.json categories-data.json
  
  # Check if app exists in PM2
  if pm2 list | grep -q "cocktail-menu"; then
    # Restart the application
    PORT=3000 pm2 restart cocktail-menu
  else
    # Start the application if it's not running
    echo "Application is not running. Starting now..."
    PORT=3000 pm2 start server.js --name "cocktail-menu"
  fi
  
  echo "Application restarted. Access at http://$(hostname -I | awk '{print $1}'):3000"
}

# Update the application
update_app() {
  echo "Updating cocktail-menu application..."
  
  # Pull latest changes
  git pull
  
  # Install any new dependencies
  npm install
  
  # Stop the application if it's running
  if pm2 list | grep -q "cocktail-menu"; then
    echo "Stopping existing application..."
    pm2 stop cocktail-menu
    pm2 delete cocktail-menu
  fi
  
  # Delete data files to force regeneration
  echo "Cleaning up data files..."
  rm -f recipes-data.json categories-data.json
  
  # Start the application
  echo "Starting application with fresh data..."
  PORT=3000 pm2 start server.js --name "cocktail-menu"
  
  echo "Update complete. Access at http://$(hostname -I | awk '{print $1}'):3000"
}

# Check application status
check_status() {
  check_pm2
  echo "Checking cocktail-menu application status..."
  pm2 info cocktail-menu
}

# View application logs
view_logs() {
  check_pm2
  echo "Viewing cocktail-menu application logs..."
  pm2 logs cocktail-menu
}

# Regenerate data files
regenerate_data() {
  echo "Regenerating data files..."
  
  # Delete existing data files
  echo "Cleaning up data files..."
  rm -f recipes-data.json categories-data.json
  
  # Call the API endpoint to regenerate data
  echo "Calling regeneration endpoint..."
  curl -s http://localhost:3000/generate-data
  
  echo "Data regeneration complete."
}

# Main script logic
case "$1" in
  start)
    start_app
    ;;
  stop)
    stop_app
    ;;
  restart)
    restart_app
    ;;
  update)
    update_app
    ;;
  status)
    check_status
    ;;
  logs)
    view_logs
    ;;
  regenerate)
    regenerate_data
    ;;
  *)
    show_usage
    ;;
esac
