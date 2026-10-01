# Real-Time Booking System

A modern full-stack booking platform built with Laravel, React, React Native, and Docker. This project includes a web frontend, mobile app, and real-time booking communication for a seamless booking experience across multiple platforms.

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel 13" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/React_Native-0.81-20232A?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker" alt="Docker Compose" />
</p>

## Overview

This repository contains a complete real-time booking system with separate modules for:

- Backend API powered by Laravel
- Web application powered by React + Vite
- Mobile app powered by Expo + React Native
- Nginx-based deployment and static hosting
- Real-time updates using Laravel broadcasting / Reverb

The system is designed for speed, scalability, and multi-platform usability, making it suitable for service booking, reservation workflows, and live availability updates.

---

## Features

- Real-time booking updates
- Multi-platform access with web and mobile
- Laravel-based backend API
- Event-driven real-time communication
- Modern front-end experience with React
- Responsive UI
- Localization support via i18next
- Docker-ready project setup
- Secure configuration with environment variables
- Queue and background job support

---

## Tech Stack

### Backend
- PHP 8.3
- Laravel 13
- Laravel Sanctum
- Laravel Reverb
- Composer
- MySQL / Postgres-compatible database support

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Zustand
- i18next
- Leaflet map support

### Mobile App
- React Native
- Expo
- Navigation and security libraries
- Secure storage
- Map and file-sharing integrations

### Infrastructure
- Docker Compose
- NGINX
- SSL support
- Frontend static asset hosting

---

## Project Structure

```text
real-time-booking-system/
├── app/                  # React Native mobile app
│   ├── src/
│   ├── package.json
│   ├── App.js
│   ├── app.json
│   └── ...
├── backend/              # Laravel API backend
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── composer.json
│   ├── .env.example
│   ├── artisan
│   └── ...
├── frontend/             # React web frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── nginx/                # Nginx configuration
│   └── nginx.conf
├── compose.yml           # Docker Compose config
├── .gitignore
├── LICENSE
└── README.md
```

---

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+
- npm
- PHP 8.3+
- Composer
- MySQL or PostgreSQL
- Docker and Docker Compose
- Expo CLI
- Git

---

## Installation

### 1) Clone the repository

```bash
git clone https://github.com/Dulanga-Dilshan/real-time-booking-system.git
cd real-time-booking-system
```

---

### 2) Setup the backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

If you are using broadcasting or Reverb:

```bash
php artisan reverb:start
```

For queue processing:

```bash
php artisan queue:work
```

---

### 3) Setup the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend should run locally at:

```text
http://localhost:5173
```

---

### 4) Setup the mobile app

```bash
cd ../app
npm install
npx expo start
```

You can run the app on:
- Android emulator
- iOS simulator
- Expo Go
- Web preview

---

### 5) Run with Docker

From the project root:

```bash
docker compose up --build
```

This starts the Nginx service and serves the frontend build through the configured container.

---

## Environment Configuration

### Backend (.env)

Create a `.env` file in `backend/` by copying `.env.example`, then update values such as:

```env
APP_NAME="Real-Time Booking System"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=booking_system
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=reverb
CACHE_DRIVER=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
```

### Frontend

If your frontend needs an API base URL or real-time key:

```env
VITE_API_URL=http://localhost:8000
VITE_REVERB_APP_KEY=your-app-key
```

---

## API

The Laravel backend provides APIs for:

- authentication
- booking management
- availability checks
- reservation workflows
- user-related operations
- notifications / broadcasts

To view the route list:

```bash
cd backend
php artisan route:list
```

---

## Real-Time Features

This project is built with real-time communication in mind. It supports features like:

- live booking updates
- availability state changes
- instant notification delivery
- interactive admin or user-facing updates

This is handled through Laravel broadcasting and its Reverb-compatible stack.

---

## Production Deployment

For production deployment:

1. Set `APP_ENV=production`
2. Configure secure database credentials
3. Build the frontend:

```bash
cd frontend
npm run build
```

4. Serve the production build through NGINX or another web server
5. Start Laravel queue workers
6. Use secure environment variables and production secrets

---

## Contributing

Contributions are welcome.

```bash
git checkout -b feature/my-feature
# make your changes
git add .
git commit -m "Add new feature"
git push origin feature/my-feature
```

Then open a pull request on GitHub.

---

## License

This project is licensed under the MIT License. Please refer to the LICENSE file included in the repository for full details.

---

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend
cd ../frontend
npm install
npm run dev

# Mobile
cd ../app
npm install
npx expo start
```

---

## Project Summary

This repository is a full-stack real-time booking application with a Laravel backend, React web frontend, and Expo mobile app, all connected under a unified booking workflow. It is ideal for learning, extending, and deploying a modern multi-platform reservation system.

If you want, I can also generate:
- a more premium GitHub-style README
- a shorter README for a portfolio
- a README with screenshot placeholders
- a README specifically tailored for a booking/reservation business theme
