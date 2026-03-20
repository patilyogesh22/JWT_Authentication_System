# JWT Authentication System

A full-stack authentication system built with **Django REST Framework** and **JWT tokens**. Includes user registration, secure login, and a protected profile page — all connected to a clean dark-themed frontend.

> Built as part of the Bidyut Placement Drive — Full Stack Developer Assignment

---

App is now live at **http://YOUR_EC2_PUBLIC_IP**

## Features

- User registration with hashed passwords
- JWT login returning access + refresh tokens
- Protected `/profile` route — rejects requests without a valid token
- Token stored in `localStorage`, sent as `Authorization: Bearer` header
- Responsive dark glassmorphism UI with smooth animations
- REST API documented and testable via VS Code REST Client

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.x + Django REST Framework |
| Authentication | djangorestframework-simplejwt |
| Database | SQLite (development) |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Fonts | Syne + DM Sans (Google Fonts) |
| Production Server | Gunicorn + Nginx |
| Deployment | AWS EC2 — Ubuntu 22.04 |

---

## Folder Structure

```
jwt_auth_project/
│
├── auth_project/               # Django settings package
│   ├── settings.py             # All config — JWT, CORS, DRF
│   ├── urls.py                 # Root URL routing
│   ├── wsgi.py
│   └── asgi.py
│
├── accounts/                   # Main Django app
│   ├── models.py               # Uses Django built-in User model
│   ├── serializers.py          # Register + User serializers
│   ├── views.py                # RegisterView, LoginView, ProfileView
│   ├── urls.py                 # App-level URL patterns
│   └── admin.py
│
├── templates/                  # HTML templates
│   ├── base.html               # Base layout with static tags
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   └── profile.html            # Protected profile page
│
├── static/
│   ├── css/style.css           # Dark glassmorphism UI styles
│   └── js/auth.js              # JWT logic — login, register, profile
│
├── .env                        # Secret keys (never commit this)
├── .env.example                # Safe template to share
├── .gitignore
├── manage.py
└── requirements.txt
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register/` | Create a new user account | No |
| POST | `/api/login/` | Login and receive JWT tokens | No |
| GET | `/api/profile/` | Fetch logged-in user details | Bearer token |

### Register — `POST /api/register/`

```json
// Request
{ "username": "johndoe", "email": "john@example.com", "password": "mypassword123" }

// Response 201
{ "message": "User created successfully" }
```

### Login — `POST /api/login/`

```json
// Request
{ "username": "johndoe", "password": "mypassword123" }

// Response 200
{ "access": "eyJhbGci...", "refresh": "eyJhbGci..." }
```

### Profile — `GET /api/profile/`

```
// Header
Authorization: Bearer <access_token>

// Response 200
{ "id": 1, "username": "johndoe", "email": "john@example.com", "date_joined": "2026-03-20T10:00:00Z" }
```

---

## Local Setup

### Prerequisites
- Python 3.10+
- Git
- VS Code

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/jwt_auth_project.git
cd jwt_auth_project

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac / Linux

# 3. Install all dependencies
pip install -r requirements.txt

# 4. Create .env file in root folder
SECRET_KEY=your-generated-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# 5. Generate a secret key (run this and paste output into .env)
python -c "import secrets; print(secrets.token_urlsafe(50))"

# 6. Apply migrations
python manage.py migrate

# 7. Start the development server
python manage.py runserver
```

Open **http://127.0.0.1:8000** in your browser.

---

## Deploy on AWS EC2

### 1. Launch EC2 Instance
- AMI: **Ubuntu Server 22.04 LTS**
- Type: **t2.micro** (free tier)
- Security Group: open port **22** (SSH), **80** (HTTP)
- Download the `.pem` key file

### 2. SSH into the server

```bash
chmod 400 your-key.pem                        # Mac/Linux
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. Install dependencies on server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx git -y
```

### 4. Clone and configure project

```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/jwt_auth_project.git app
cd app

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn

# Create .env on server
nano .env
# Add: SECRET_KEY, DEBUG=False, ALLOWED_HOSTS=YOUR_EC2_PUBLIC_IP

python manage.py migrate
python manage.py collectstatic --no-input
```

### 5. Set up Gunicorn as a service

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

```ini
[Unit]
Description=Gunicorn for JWT Auth Project
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/home/ubuntu/app/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    auth_project.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/jwt_auth
```

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location /static/ {
        alias /home/ubuntu/app/staticfiles/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/jwt_auth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Redeploy after changes

```bash
cd /home/ubuntu/app
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
sudo systemctl restart gunicorn
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key — generate with `secrets.token_urlsafe(50)` |
| `DEBUG` | `True` for local, `False` for production |
| `ALLOWED_HOSTS` | Comma-separated — `localhost,127.0.0.1` or your EC2 IP |

---

## Author

**Bidyut** — Full Stack Developer  
Placement Drive Assignment — Full Stack Role