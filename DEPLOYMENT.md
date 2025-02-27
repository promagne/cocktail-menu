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

3. **Configure the server (optional)**
   
   By default, the server runs on port 3000. If you need to change this (for example, to use port 80 for HTTP), edit the `server.js` file:
   
   ```javascript
   // Change this line in server.js
   const PORT = process.env.PORT || 3000;
   
   // To use a different port, for example:
   const PORT = process.env.PORT || 80;
   ```

4. **Start the server**
   
   For a quick test:
   ```bash
   node server.js
   ```
   
   The server should start and display: "Server running at http://your-ip:port"

## Running as a Service

To keep the server running after you log out, you can use a process manager like PM2:

1. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

2. **Start the application with PM2**
   ```bash
   pm2 start server.js --name "cocktail-menu"
   ```

3. **Configure PM2 to start on system boot**
   ```bash
   pm2 startup
   pm2 save
   ```

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

- **Server not starting**: Check for error messages in the console
- **Cannot access the website**: Verify firewall settings and that the server is running
- **Missing data**: Ensure the server has generated the data files (recipes-data.json and categories-data.json)

## Updating the Website

To update the website with new changes:

```bash
git pull  # If you used git to clone the repository
npm install  # If there are new dependencies
pm2 restart cocktail-menu  # If using PM2
```
