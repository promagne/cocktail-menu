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
  echo "  force-restart - Force restart the application (stop and start)"
  echo "  update   - Pull latest changes and restart"
  echo "  status   - Check application status"
  echo "  logs     - View application logs"
  echo "  regenerate - Regenerate data files"
  echo "  cleanup  - Clean up stale processes and ports"
}

# Check if PM2 is installed
check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing now..."
    npm install -g pm2
  fi
}

# Check if the application is running
check_running() {
  if pm2 list | grep -q "cocktail-menu"; then
    return 0  # Application is running
  else
    return 1  # Application is not running
  fi
}

# Clean up stale processes and ports
cleanup() {
  echo "Cleaning up stale processes and ports..."
  
  # Stop and delete any existing PM2 processes
  if check_running; then
    echo "Stopping existing PM2 process..."
    pm2 stop cocktail-menu
    pm2 delete cocktail-menu
  fi
  
  # Check for any processes using port 3000
  if lsof -i:3000 &>/dev/null; then
    echo "Killing processes using port 3000..."
    lsof -ti:3000 | xargs kill -9
  fi
  
  # Delete data files
  echo "Removing data files..."
  rm -f recipes-data.json categories-data.json
  
  echo "Cleanup complete."
}

# Start the application
start_app() {
  check_pm2
  echo "Starting cocktail-menu application..."
  
  # Check if app is already running
  if check_running; then
    echo "Application is already running. Use 'restart' instead."
    exit 1
  fi
  
  # Clean up any stale processes
  cleanup
  
  # Start the application with PM2
  pm2 start server.js --name "cocktail-menu"
  echo "Application started. Access at http://$(hostname -I | awk '{print $1}'):3000 (or another port if 3000 is in use)"
}

# Stop the application
stop_app() {
  check_pm2
  echo "Stopping cocktail-menu application..."
  
  if check_running; then
    pm2 stop cocktail-menu
    pm2 delete cocktail-menu
    echo "Application stopped and removed from PM2."
  else
    echo "Application is not running."
  fi
}

# Restart the application
restart_app() {
  check_pm2
  echo "Restarting cocktail-menu application..."
  
  # Delete data files to force regeneration
  echo "Cleaning up data files..."
  rm -f recipes-data.json categories-data.json
  
  # Check if app exists in PM2
  if check_running; then
    echo "Application exists in PM2, restarting..."
    pm2 restart cocktail-menu
  else
    echo "Application not found in PM2, starting fresh..."
    pm2 start server.js --name "cocktail-menu"
  fi
  
  echo "Application restarted. Access at http://$(hostname -I | awk '{print $1}'):3000 (or another port if 3000 is in use)"
}

# Force restart the application (stop and start)
force_restart() {
  check_pm2
  echo "Force restarting cocktail-menu application..."
  
  # Clean up everything
  cleanup
  
  # Start the application
  echo "Starting application with fresh data..."
  pm2 start server.js --name "cocktail-menu"
  
  echo "Application force restarted. Access at http://$(hostname -I | awk '{print $1}'):3000 (or another port if 3000 is in use)"
}

# Update the application
update_app() {
  echo "Updating cocktail-menu application..."
  
  # Pull latest changes
  git pull
  
  # Install any new dependencies
  npm install
  
  # Force restart
  force_restart
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
  
  # Check if the application is running
  if ! check_running; then
    echo "Error: Application is not running. Start it first with './deploy.sh start'"
    exit 1
  fi
  
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
  force-restart)
    force_restart
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
  cleanup)
    cleanup
    ;;
  *)
    show_usage
    ;;
esac
