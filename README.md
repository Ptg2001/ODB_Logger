# OBD Logger

A mobile application for logging and monitoring OBD-II data from vehicles.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Android Studio (for building Android APK)
- PostgreSQL database

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Ptg2001/ODB_Logger.git
cd ODB_Logger
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment files:
   - Copy `.env.example` to `.env` for development
   - Copy `.env.example` to `.env.production` for production

4. Configure your environment variables:
   - Update `.env` with your development database credentials
   - Update `.env.production` with your production database credentials

### Database Setup

1. Create a PostgreSQL database
2. Run the database setup script:
```bash
npm run setup-db
# or
yarn setup-db
```

3. Apply the database schema:
```bash
npm run apply-schema
# or
yarn apply-schema
```

### Building the Android APK

1. Install Capacitor dependencies:
```bash
npm install @capacitor/android
# or
yarn add @capacitor/android
```

2. Build the web application:
```bash
npm run build
# or
yarn build
```

3. Add Android platform:
```bash
npx cap add android
```

4. Open Android Studio:
```bash
npx cap open android
```

5. In Android Studio:
   - Wait for the project to sync
   - Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
   - The APK will be generated in `android/app/build/outputs/apk/debug/`

### Development

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. For live reload on Android:
```bash
npx cap run android
```

## Environment Variables

Required environment variables:

- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_PORT`: Database port (default: 5432)
- `DATABASE_URL`: Alternative connection string
- `JWT_SECRET`: Secret for JWT authentication
- `NODE_ENV`: Environment (development/production)

## Security Notes

- Never commit `.env` files or any files containing sensitive information
- Use different database credentials for development and production
- Keep your JWT secret secure and different between environments
- Use SSL for database connections in production

## License

[Your License Here] 