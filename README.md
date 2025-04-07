# Root Games Tracker

A web application for tracking and analyzing games of Root, built with Cloudflare.  

You can see an example [here](https://asbyx.github.io/ggrootgames).

## 🚀 Deploy Your Own Copy

Want to deploy your own Root Games Tracker? Just click the button below:

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy%20to-Cloudflare-orange?style=for-the-badge&logo=cloudflare)](https://github.com/Asbyx/ggrootgames/fork)

### One-Click Deployment Instructions

1. Click the **Deploy to Cloudflare** button above to fork this repository
2. Go to the **Actions** tab in your forked repository
3. Run the **Setup Deployment Tokens** workflow and follow the instructions:
   - You'll need to create a Cloudflare API Token with appropriate permissions
   - You'll need your Cloudflare Account ID
   - Add these as secrets to your GitHub repository
4. Run the **Deploy to Cloudflare** workflow
   - Enter a name for your project (e.g., "rootgames")
5. Once completed, you can access your site at the URL shown in the workflow output!

That's it! No coding knowledge required. Your Root Games Tracker is now deployed with its own database.

If you like my work, [consider offering me a coffee](https://buymeacoffee.com/asbyx) !  

If you see a bug, or would like to see some features added: you can [declare an issue](https://github.com/Asbyx/ggrootgames/issues) ! Or even [make a pull request](https://github.com/Asbyx/ggrootgames/pulls) if you would like to contribute directly ! 


## Features

- **Game Reporting**: Report games with detailed player performance data
- **Statistics Dashboard**: View leaderboards and game statistics
- **Player Statistics**: Get a player statistics and compare two players
- **Responsive Design**: Works on both mobile and desktop devices

## Manual Deployment (Alternative Method)

If you prefer to deploy manually, follow these steps:

1. **Prerequisites**
   - Create a [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is sufficient)
   - Download and extract the [latest release](https://github.com/Asbyx/ggrootgames/releases/latest)
   - Install [Node.js](https://nodejs.org/) (v18 or later)

2. **Setup and Deploy**
   - Open a command prompt in the project folder
   - Run `npm install`
   - Install Wrangler v4: `npm install -g wrangler@4`
   - Log in to Cloudflare: `npx wrangler login`
   - Create a D1 database: `npx wrangler d1 create rootgames`
   - In `wrangler.toml`, update:
     - `database_id` with your new database ID
     - `name` and `database_name` with your chosen project name
   - Deploy: `npx wrangler deploy`
   - Initialize database: `npx wrangler d1 execute rootgames --file=./db/schema.sql`

3. **Access Your Site**
   - Go to the Cloudflare dashboard → Workers & Pages
   - Find your deployment and click "Visit Site"

## Development Setup

### Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Pages

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/Asbyx/ggrootgames.git
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

## API Endpoints

The application provides various API endpoints for user management, faction management, game reporting, and statistics. Full documentation is available in the [API Documentation](docs/api.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Root Board Game](https://ledergames.com/products/root-a-game-of-woodland-might-and-right) by Leder Games
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://pages.cloudflare.com/) 
- [Flaticons](https://flaticon.com)