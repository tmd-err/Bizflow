# BizFlow

Business management ERP built with Next.js, Laravel API, and PostgreSQL.

## Tech Stack

- Next.js
- Laravel
- PostgreSQL
- Laravel Sanctum
- Tailwind CSS

## Project Structure

BizFlow/
├── erp-api/        # Laravel API
└── erp-frontend/   # Next.js frontend

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- PostgreSQL

## Backend Setup

cd erp-api

composer install

cp .env.example .env

php artisan key:generate

Configure your PostgreSQL database in `.env`:

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=bizflow
DB_USERNAME=your_username
DB_PASSWORD=your_password

Run migrations and seeders:

php artisan migrate
php artisan db:seed

Start the Laravel API:

php artisan serve

The API will be available at:

http://127.0.0.1:8000

## Frontend Setup

cd erp-frontend

npm install

Create `.env.local`:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

Start the development server:

npm run dev

The frontend will be available at:

http://localhost:3000

## Development

Run the backend:

cd erp-api
php artisan serve

Run the frontend:

cd erp-frontend
npm run dev

## License

This project is currently under development.
