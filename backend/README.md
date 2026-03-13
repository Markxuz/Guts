## Database Setup (New PC)

1. Install dependencies:
   - `npm install`
2. Create an empty MySQL database (example):
   - `CREATE DATABASE your_database_name;`
3. Create your environment file:
   - Copy `.env.example` to `.env`
   - Set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_HOST`
4. Start the backend:
   - `npm start`

On first run, the server uses Sequelize `sync({ force: false })` to create missing tables automatically.
