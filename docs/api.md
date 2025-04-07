# API Documentation

This document provides details about all the available API endpoints in the Root Games Tracker application.

## User Management

### Get All Users
```
GET /api/users
```
Returns a list of all registered users.

### Create a New User
```
POST /api/users
```
Creates a new user in the system.

**Request Body:**
```json
{
  "name": "Username"
}
```

### Search for Users
```
GET /api/users/search?query=searchterm
```
Searches for users matching the provided query.

## Faction Management

### Get All Factions
```
GET /api/factions
```
Returns a list of all available factions in the game.

## Game Management

### Get Recent Games
```
GET /api/games
```
Returns a list of recently played games.

### Report a New Game
```
POST /api/games
```
Records a new game with player performances.

**Request Body:**
```json
{
  "date": "2023-03-15",
  "map": "Autumn",
  "players": [
    {
      "user_id": 1,
      "faction_id": 3,
      "score": 30,
      "winner": true
    },
    {
      "user_id": 2,
      "faction_id": 1,
      "score": 25,
      "winner": false
    }
  ]
}
```

## Statistics

### Get Player Leaderboard by Winrate
```
GET /api/stats/leaderboard
```
Returns a leaderboard of players sorted by win rate.

### Get Player Leaderboard by Games Played
```
GET /api/stats/most-played
```
Returns a leaderboard of players sorted by number of games played.

### Get Faction Leaderboard by Wins
```
GET /api/stats/factions/wins
```
Returns a leaderboard of factions sorted by number of wins.

### Get Faction Leaderboard by Popularity
```
GET /api/stats/factions/popularity
```
Returns a leaderboard of factions sorted by popularity (number of times played).

### Compare Two Players
```
GET /api/stats/player-comparison?player1=1&player2=2
```
Returns comparative statistics between two players.

### Get Detailed Player Stats
```
GET /api/stats/player?id=1
```
Returns detailed statistics for a specific player. 