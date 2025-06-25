# Calendar App Deployment Guide

This guide provides instructions for deploying both the backend API and frontend application to production environments.

## Backend Deployment

### Prerequisites
- Python 3.9+ installed
- PostgreSQL database server
- WSGI server (Gunicorn recommended)
- Nginx or Apache for reverse proxy (optional but recommended)
- SSL certificate for HTTPS

### Deployment Steps

#### 1. Prepare Database
1. Create a PostgreSQL database:
```sql
CREATE DATABASE calendar_app_prod;
CREATE USER calendar_app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE calendar_app_prod TO calendar_app_user;
```

#### 2. Prepare Environment
1. Clone the repository:
```bash
git clone https://github.com/yourusername/calendar_app.git
cd calendar_app/backend
```
2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
3. Install dependencies:
```bash
pip install -r requirements.txt
pip install gunicorn psycopg2-binary  # Additional production dependencies
```
4. Create .env file with production settings:
```
FLASK_ENV=production
SECRET_KEY=your_very_secure_random_key
DATABASE_URI=postgresql://calendar_app_user:secure_password@localhost/calendar_app_prod
JWT_SECRET_KEY=another_secure_random_key
```
#### 3. Database Setup

1. Initialize the database:
```bash
export FLASK_APP=run.py
flask db upgrade
```

#### 4. Configure Gunicorn
1. Create a wsgi.py file:
```Python
from run import app

if __name__ == "__main__":
    app.run()
```

2. Test Gunicorn:
```bash
gunicorn --bind 0.0.0.0:5000 wsgi:app
```

#### 5. Setup Systemd Service (for Linux servers)
1. Create a systemd service file /etc/systemd/system/calendar-app.service:
```INI
[Unit]
Description=Calendar App Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/calendar_app/backend
Environment="PATH=/path/to/calendar_app/backend/venv/bin"
ExecStart=/path/to/calendar_app/backend/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5000 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Enable and start the service:
```bash
sudo systemctl enable calendar-app
sudo systemctl start calendar-app
```

#### 6. Configure Nginx as Reverse Proxy
1. Create Nginx configuration /etc/nginx/sites-available/calendar-app:

```
    server {
        listen 80;
        server_name api.yourcalendarapp.com;
    
        location / {
            proxy_pass http://localhost:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
```

2. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/calendar-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
3. Set up SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourcalendarapp.com
```

## Frontend Deployment

### Prerequisites
- Node.js 16+ and npm
- Web server (Nginx/Apache) for static file hosting

### Deployment Steps

#### 1. Prepare Frontend Build
1. Update API endpoint in .env file:
```
REACT_APP_API_URL=https://api.yourcalendarapp.com
```
2. Build the production version:
```bash
cd ../frontend
npm install
npm run build
```
#### 2. Deploy to Web Server
1. Copy the build directory to your web server:
```bash
scp -r build/* user@your-server:/var/www/calendar-app/
```
2. Configure Nginx:
```Code
    server {
        listen 80;
        server_name app.yourcalendarapp.com;
        root /var/www/calendar-app;
        index index.html;
    
        location / {
            try_files $uri /index.html;
        }
    }
```
3. Set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d app.yourcalendarapp.com
```

## Docker Deployment (Alternative)
If you prefer using Docker, you can containerize both the frontend and backend.

### Backend Docker Setup
#### 1. Create a Dockerfile in the backend directory:
```Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn psycopg2-binary

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]
```

#### 2. Build and run the Docker container:
```bash
docker build -t calendar-app-backend .
docker run -d -p 5000:5000 --env-file .env --name calendar-backend calendar-app-backend
```

### Frontend Docker Setup
#### 1. Create a Dockerfile in the frontend directory:
```Dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
#### 2. Create nginx.conf:
```Code
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

#### 3.Build and run the frontend container:
```bash
docker build -t calendar-app-frontend .
docker run -d -p 80:80 --name calendar-frontend calendar-app-frontend
```

### Docker Compose
For easier management, create a docker-compose.yml file:

```YAML
version: '3'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: calendar_app
      POSTGRES_USER: calendar_app_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    depends_on:
      - db
    environment:
      - DATABASE_URI=postgresql://calendar_app_user:secure_password@db/calendar_app
      - SECRET_KEY=your_secure_key
      - JWT_SECRET_KEY=another_secure_key
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  db_data:
```

Run with:
```bash
docker-compose up -d
```