# Deployment Guide for Cocktail Menu Website

This guide will help you deploy the Cocktail Menu website on a web server.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git (optional, for pulling updates)

## Installation Steps

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/promagne/cocktail-menu.git
   cd cocktail-menu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Make the deployment script executable**
   ```bash
   chmod +x deploy.sh
   ```

4. **Start the server using the deployment script**
   ```bash
   ./deploy.sh start
   ```
   
   The server should start and display: "Server running at http://your-ip:port"

## Using the Deployment Script

The cocktail-menu application comes with a powerful deployment script that handles various aspects of deployment and maintenance:

```bash
./deploy.sh [command]
```

Available commands:

- `start` - Start the application
- `stop` - Stop the application
- `restart` - Restart the application
- `force-restart` - Force restart the application (stop and start)
- `update` - Pull latest changes and restart
- `status` - Check application status
- `logs` - View application logs
- `regenerate` - Regenerate data files
- `cleanup` - Clean up stale processes and ports

## Updating Recipes

To update recipes on the server:

1. **Navigate to the cocktail-menu directory**
   ```bash
   cd ~/cocktail-menu
   ```

2. **Pull the latest changes from GitHub**
   ```bash
   git pull
   ```

3. **Restart the application to regenerate data files**
   ```bash
   ./deploy.sh force-restart
   ```

This will pull the latest recipe files, stop the current server, and start a fresh instance that will generate new data files with the updated recipes.

## Running as a Service

To keep the server running after you log out, you can use PM2 (which is already used by the deployment script):

1. **Save the PM2 process list to be restored on reboot**
   ```bash
   pm2 save
   ```

2. **Configure PM2 to start on system boot**
   ```bash
   pm2 startup
   ```
   Then follow the instructions displayed by the command.

## Configuring Nginx as a Reverse Proxy (Recommended)

For better performance and security, you can use Nginx as a reverse proxy:

1. **Install Nginx**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Create a new Nginx configuration file**
   ```bash
   sudo nano /etc/nginx/sites-available/cocktail-menu
   ```

3. **Add the following configuration**
   ```nginx
   server {
       listen 80;
       server_name 4.248.23.114;  # Replace with your domain if you have one

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable the site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/cocktail-menu /etc/nginx/sites-enabled/
   sudo nginx -t  # Test the configuration
   sudo systemctl restart nginx
   ```

## Firewall Configuration

If you're using a firewall, make sure to allow HTTP traffic:

```bash
sudo ufw allow 80/tcp  # For HTTP
sudo ufw allow 443/tcp  # For HTTPS (if you configure SSL later)
```

## SSL Configuration (Optional but Recommended)

For HTTPS support, you can use Certbot to obtain a free SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com  # Replace with your domain
```

## Troubleshooting

- **Port conflicts**: If you encounter port conflicts (EADDRINUSE errors), use the cleanup command:
  ```bash
  ./deploy.sh cleanup
  ```
  
- **Application not starting**: Check the logs for errors:
  ```bash
  ./deploy.sh logs
  ```

- **Missing data**: If recipe data isn't showing up, regenerate the data files:
  ```bash
  ./deploy.sh regenerate
  ```

- **PM2 errors**: If PM2 shows errors, try a force restart:
  ```bash
  ./deploy.sh force-restart
  ```

## Server Maintenance

- **Checking server status**:
  ```bash
  ./deploy.sh status
  ```

- **Viewing logs**:
  ```bash
  ./deploy.sh logs
  ```

- **Updating the application**:
  ```bash
  ./deploy.sh update
  ```
