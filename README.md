# Grand Groupe Root Games Tracker

A web application for tracking and analyzing games of Root, built with Cloudflare Pages, Workers, and D1.

## Features

- **User Accounts**: Create accounts with unique usernames and preferred factions
- **Game Reporting**: Report games with detailed player performance data
- **Statistics Dashboard**: View leaderboards and game statistics
- **Player Comparison**: Compare statistics between any two players
- **Responsive Design**: Works on both mobile and desktop devices

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Pages

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare Workers CLI)
- Cloudflare account with Workers and D1 access

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ggrootgames.git
   cd ggrootgames
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a D1 database (if not already created):
   ```
   npm run db:create
   ```

4. Initialize the database schema:
   ```
   npm run db:execute
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:8787`

## Deployment

1. Log in to Cloudflare:
   ```
   npx wrangler login
   ```

2. Deploy the application:
   ```
   npm run deploy
   ```

3. Initialize the production database:
   ```
   npm run db:execute:prod
   ```

## Project Structure

- `frontend/`: Static assets for the frontend
  - `css/`: Stylesheets
  - `js/`: JavaScript modules
  - `img/`: Images and assets
- `backend/`: Cloudflare Workers code
- `db/`: Database schema and migrations

## API Endpoints

### User Management
- `GET /api/users`: Get all users
- `POST /api/users`: Create a new user
- `GET /api/users/search`: Search for users

### Faction Management
- `GET /api/factions`: Get all factions

### Game Management
- `GET /api/games`: Get recent games
- `POST /api/games`: Report a new game

### Statistics
- `GET /api/stats/leaderboard`: Get player leaderboard by winrate
- `GET /api/stats/most-played`: Get player leaderboard by games played
- `GET /api/stats/factions/wins`: Get faction leaderboard by wins
- `GET /api/stats/factions/popularity`: Get faction leaderboard by popularity
- `GET /api/stats/player-comparison`: Compare two players
- `GET /api/stats/player`: Get detailed stats for a player

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Root Board Game](https://ledergames.com/products/root-a-game-of-woodland-might-and-right) by Leder Games
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://pages.cloudflare.com/) 