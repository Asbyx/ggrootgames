export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        // CORS headers for all responses
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };
        
        // Handle OPTIONS requests for CORS
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: corsHeaders
            });
        }
        
        // API Routes
        if (path.startsWith("/api/")) {
            // Add CORS headers to all API responses
            const responseInit = {
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                }
            };
            
            try {
                // User Management
                if (path === "/api/users" && request.method === "GET") {
                    return await getUsers(env, responseInit);
                } else if (path === "/api/users" && request.method === "POST") {
                    return await createUser(request, env, responseInit);
                } else if (path === "/api/users/search" && request.method === "GET") {
                    return await searchUsers(request, env, responseInit);
                }
                
                // Faction Management
                else if (path === "/api/factions" && request.method === "GET") {
                    return await getFactions(env, responseInit);
                }
                
                // Game Management
                else if (path === "/api/games" && request.method === "GET") {
                    return await getGames(env, responseInit);
                } else if (path === "/api/games" && request.method === "POST") {
                    return await reportGame(request, env, responseInit);
                }
                
                // Statistics
                else if (path === "/api/stats/leaderboard" && request.method === "GET") {
                    return await getLeaderboard(env, responseInit);
                } else if (path === "/api/stats/most-played" && request.method === "GET") {
                    return await getMostPlayedLeaderboard(env, responseInit);
                } else if (path === "/api/stats/factions/wins" && request.method === "GET") {
                    return await getFactionWinsLeaderboard(env, responseInit);
                } else if (path === "/api/stats/factions/popularity" && request.method === "GET") {
                    return await getFactionPopularityLeaderboard(env, responseInit);
                } else if (path === "/api/stats/player-comparison" && request.method === "GET") {
                    return await getPlayerComparison(request, env, responseInit);
                } else if (path === "/api/stats/player" && request.method === "GET") {
                    return await getPlayerStats(request, env, responseInit);
                }
                
                // If no API route matches
                return new Response(JSON.stringify({ error: "API endpoint not found" }), {
                    status: 404,
                    ...responseInit
                });
            } catch (error) {
                console.error("API Error:", error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    ...responseInit
                });
            }
        }
        
        // For all other routes, serve static assets using the ASSETS binding
        try {
            return env.ASSETS.fetch(request);
        } catch (e) {
            console.error("Error serving static asset:", e);
            return new Response("Not Found: " + path, { status: 404 });
        }
    }
};

// User Management Functions
async function getUsers(env, responseInit) {
    const { results } = await env.DB.prepare("SELECT * FROM users ORDER BY name").all();
    return new Response(JSON.stringify(results), responseInit);
}

async function createUser(request, env, responseInit) {
    const { name, preferred_faction_id } = await request.json();
    
    // Check if user already exists
    const existingUser = await env.DB.prepare("SELECT id FROM users WHERE name = ?").bind(name).first();
    if (existingUser) {
        return new Response(JSON.stringify({ error: "User already exists" }), {
            status: 400,
            ...responseInit
        });
    }
    
    // Create new user
    const result = await env.DB.prepare(
        "INSERT INTO users (name, preferred_faction_id) VALUES (?, ?) RETURNING id"
    ).bind(name, preferred_faction_id).first();
    
    return new Response(JSON.stringify({ id: result.id, name, preferred_faction_id }), {
        status: 201,
        ...responseInit
    });
}

async function searchUsers(request, env, responseInit) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    const { results } = await env.DB.prepare(
        "SELECT * FROM users WHERE name LIKE ? ORDER BY name LIMIT 10"
    ).bind(`%${query}%`).all();
    
    return new Response(JSON.stringify(results), responseInit);
}

// Faction Management Functions
async function getFactions(env, responseInit) {
    const { results } = await env.DB.prepare("SELECT * FROM factions ORDER BY name").all();
    return new Response(JSON.stringify(results), responseInit);
}

// Game Management Functions
async function getGames(env, responseInit) {
    const { results } = await env.DB.prepare(`
        SELECT 
            g.id, 
            g.report_date, 
            g.notes,
            json_group_array(
                json_object(
                    'participant_id', gp.id,
                    'user_id', gp.user_id,
                    'user_name', u.name,
                    'faction_id', gp.faction_id,
                    'faction_name', f.name,
                    'points', gp.points,
                    'ranking', gp.ranking
                )
            ) as participants
        FROM games g
        JOIN game_participants gp ON g.id = gp.game_id
        JOIN users u ON gp.user_id = u.id
        JOIN factions f ON gp.faction_id = f.id
        GROUP BY g.id
        ORDER BY g.report_date DESC
        LIMIT 50
    `).all();
    
    // Parse the JSON string in participants
    const games = results.map(game => ({
        ...game,
        participants: JSON.parse(game.participants)
    }));
    
    return new Response(JSON.stringify(games), responseInit);
}

async function reportGame(request, env, responseInit) {
    const gameData = await request.json();
    const { participants, notes } = gameData;
    
    // Start a transaction
    const db = env.DB;
    
    try {
        // Insert game record
        const gameResult = await db.prepare(
            "INSERT INTO games (notes) VALUES (?) RETURNING id"
        ).bind(notes || null).first();
        
        const gameId = gameResult.id;
        
        // Insert all participants
        for (const participant of participants) {
            await db.prepare(`
                INSERT INTO game_participants (game_id, user_id, faction_id, points, ranking)
                VALUES (?, ?, ?, ?, ?)
            `).bind(
                gameId,
                participant.user_id,
                participant.faction_id,
                participant.points,
                participant.ranking
            ).run();
        }
        
        return new Response(JSON.stringify({ id: gameId, message: "Game recorded successfully" }), {
            status: 201,
            ...responseInit
        });
    } catch (error) {
        console.error("Error reporting game:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            ...responseInit
        });
    }
}

// Statistics Functions
async function getLeaderboard(env, responseInit) {
    try {
        const { results } = await env.DB.prepare(`
            WITH player_stats AS (
                SELECT
                    u.id AS user_id,
                    u.name AS user_name,
                    COUNT(gp.id) AS games_played,
                    SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
                    CASE 
                        WHEN COUNT(gp.id) > 0 THEN ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2)
                        ELSE 0
                    END AS winrate,
                    ROUND(AVG(gp.points), 2) AS avg_points,
                    ROUND(AVG(gp.ranking), 2) AS avg_place
                FROM users u
                LEFT JOIN game_participants gp ON u.id = gp.user_id
                GROUP BY u.id, u.name
            ),
            best_faction AS (
                SELECT
                    gp.user_id,
                    f.id AS faction_id,
                    f.name AS faction_name,
                    COUNT(gp.id) AS times_played,
                    SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS faction_wins,
                    CASE 
                        WHEN COUNT(gp.id) > 0 THEN ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2)
                        ELSE 0
                    END AS faction_winrate,
                    ROUND(AVG(gp.points), 2) AS faction_avg_points,
                    ROUND(AVG(gp.ranking), 2) AS avg_ranking
                FROM game_participants gp
                JOIN factions f ON gp.faction_id = f.id
                GROUP BY gp.user_id, f.id, f.name
            ),
            ranked_factions AS (
                SELECT
                    user_id,
                    faction_id,
                    faction_name,
                    times_played,
                    faction_wins,
                    faction_winrate,
                    faction_avg_points,
                    avg_ranking,
                    ROW_NUMBER() OVER (
                        PARTITION BY user_id 
                        ORDER BY faction_winrate DESC, times_played DESC, avg_ranking ASC
                    ) AS faction_rank
                FROM best_faction
            )
            SELECT
                ps.user_id,
                ps.user_name,
                ps.games_played,
                ps.wins,
                ps.winrate,
                ps.avg_points,
                ps.avg_place,
                rf.faction_id AS best_faction_id,
                rf.faction_name AS best_faction_name,
                rf.times_played AS best_faction_plays,
                rf.faction_wins AS best_faction_wins,
                rf.faction_winrate AS best_faction_winrate
            FROM player_stats ps
            LEFT JOIN ranked_factions rf ON ps.user_id = rf.user_id AND rf.faction_rank = 1
            ORDER BY ps.wins DESC, ps.avg_place ASC, ps.avg_points DESC
        `).all();
        
        // If no results, return an empty array
        if (!results || results.length === 0) {
            return new Response(JSON.stringify([]), responseInit);
        }
        
        return new Response(JSON.stringify(results), responseInit);
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            ...responseInit
        });
    }
}

async function getMostPlayedLeaderboard(env, responseInit) {
    try {
        const { results } = await env.DB.prepare(`
            SELECT
                u.id AS user_id,
                u.name AS user_name,
                COUNT(gp.id) AS games_played,
                SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
                CASE 
                    WHEN COUNT(gp.id) > 0 THEN ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2)
                    ELSE 0
                END AS winrate
            FROM users u
            LEFT JOIN game_participants gp ON u.id = gp.user_id
            GROUP BY u.id, u.name
            ORDER BY games_played DESC
            LIMIT 50
        `).all();
        
        // If no results, return an empty array
        if (!results || results.length === 0) {
            return new Response(JSON.stringify([]), responseInit);
        }
        
        return new Response(JSON.stringify(results), responseInit);
    } catch (error) {
        console.error("Error getting most played leaderboard:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            ...responseInit
        });
    }
}

async function getFactionWinsLeaderboard(env, responseInit) {
    try {
        const { results } = await env.DB.prepare(`
            SELECT
                f.id AS faction_id,
                f.name AS faction_name,
                COUNT(gp.id) AS times_played,
                SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
                CASE 
                    WHEN COUNT(gp.id) > 0 THEN ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2)
                    ELSE 0
                END AS winrate
            FROM factions f
            LEFT JOIN game_participants gp ON f.id = gp.faction_id
            GROUP BY f.id, f.name
            ORDER BY wins DESC, winrate DESC
        `).all();
        
        // If no results, return an empty array
        if (!results || results.length === 0) {
            return new Response(JSON.stringify([]), responseInit);
        }
        
        return new Response(JSON.stringify(results), responseInit);
    } catch (error) {
        console.error("Error getting faction wins leaderboard:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            ...responseInit
        });
    }
}

async function getFactionPopularityLeaderboard(env, responseInit) {
    try {
        // First check if there are any game participants
        const { total } = await env.DB.prepare(`
            SELECT COUNT(*) as total FROM game_participants
        `).first();
        
        // If no participants, return all factions with zero stats
        if (!total || total === 0) {
            const { results } = await env.DB.prepare(`
                SELECT
                    f.id AS faction_id,
                    f.name AS faction_name,
                    0 AS times_played,
                    0 AS pick_rate,
                    0 AS wins,
                    0 AS winrate
                FROM factions f
                ORDER BY f.name
            `).all();
            
            return new Response(JSON.stringify(results), responseInit);
        }
        
        // Otherwise, get the regular stats
        const { results } = await env.DB.prepare(`
            SELECT
                f.id AS faction_id,
                f.name AS faction_name,
                COUNT(gp.id) AS times_played,
                ROUND(COUNT(gp.id) * 100.0 / (SELECT COUNT(*) FROM game_participants), 2) AS pick_rate,
                SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
                CASE 
                    WHEN COUNT(gp.id) > 0 THEN ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2)
                    ELSE 0
                END AS winrate
            FROM factions f
            LEFT JOIN game_participants gp ON f.id = gp.faction_id
            GROUP BY f.id, f.name
            ORDER BY times_played DESC, pick_rate DESC
        `).all();
        
        return new Response(JSON.stringify(results), responseInit);
    } catch (error) {
        console.error("Error getting faction popularity leaderboard:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            ...responseInit
        });
    }
}

async function getPlayerComparison(request, env, responseInit) {
    const { searchParams } = new URL(request.url);
    const player1Id = searchParams.get('player1');
    const player2Id = searchParams.get('player2');
    
    if (!player1Id || !player2Id) {
        return new Response(JSON.stringify({ error: "Both player1 and player2 parameters are required" }), {
            status: 400,
            ...responseInit
        });
    }
    
    // Get overall stats for both players
    const overallStats = await env.DB.prepare(`
        SELECT
            u.id AS user_id,
            u.name AS user_name,
            COUNT(gp.id) AS games_played,
            SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
            ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2) AS winrate,
            ROUND(AVG(gp.points), 2) AS avg_points,
            ROUND(AVG(gp.ranking), 2) AS avg_ranking
        FROM users u
        JOIN game_participants gp ON u.id = gp.user_id
        WHERE u.id IN (?, ?)
        GROUP BY u.id, u.name
    `).bind(player1Id, player2Id).all();
    
    // Get top 5 factions for each player
    const factionStats = await env.DB.prepare(`
        WITH player_factions AS (
            SELECT
                gp.user_id,
                u.name AS user_name,
                f.id AS faction_id,
                f.name AS faction_name,
                COUNT(gp.id) AS times_played,
                ROUND(COUNT(gp.id) * 100.0 / (
                    SELECT COUNT(*) FROM game_participants 
                    WHERE user_id = gp.user_id
                ), 2) AS pick_rate,
                SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
                ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2) AS winrate,
                ROW_NUMBER() OVER (
                    PARTITION BY gp.user_id 
                    ORDER BY COUNT(gp.id) DESC
                ) AS faction_rank
            FROM game_participants gp
            JOIN users u ON gp.user_id = u.id
            JOIN factions f ON gp.faction_id = f.id
            WHERE gp.user_id IN (?, ?)
            GROUP BY gp.user_id, u.name, f.id, f.name
        )
        SELECT * FROM player_factions
        WHERE faction_rank <= 5
        ORDER BY user_id, faction_rank
    `).bind(player1Id, player2Id).all();
    
    // Get head-to-head stats
    const headToHead = await env.DB.prepare(`
        WITH games_with_both_players AS (
            SELECT
                g.id AS game_id,
                MAX(CASE WHEN gp.user_id = ? THEN gp.ranking END) AS player1_ranking,
                MAX(CASE WHEN gp.user_id = ? THEN gp.ranking END) AS player2_ranking
            FROM games g
            JOIN game_participants gp ON g.id = gp.game_id
            WHERE gp.user_id IN (?, ?)
            GROUP BY g.id
            HAVING COUNT(DISTINCT gp.user_id) = 2
        )
        SELECT
            COUNT(*) AS total_games,
            SUM(CASE WHEN player1_ranking < player2_ranking THEN 1 ELSE 0 END) AS player1_wins,
            SUM(CASE WHEN player2_ranking < player1_ranking THEN 1 ELSE 0 END) AS player2_wins
        FROM games_with_both_players
    `).bind(player1Id, player2Id, player1Id, player2Id).first();
    
    const result = {
        players: overallStats.results,
        factions: factionStats.results,
        headToHead: headToHead || { total_games: 0, player1_wins: 0, player2_wins: 0 }
    };
    
    return new Response(JSON.stringify(result), responseInit);
}

async function getPlayerStats(request, env, responseInit) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            ...responseInit
        });
    }
    
    // Get overall stats
    const overallStats = await env.DB.prepare(`
        SELECT
            u.id,
            u.name,
            COUNT(gp.id) AS games_played,
            SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
            ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2) AS winrate,
            ROUND(AVG(gp.points), 2) AS avg_points,
            ROUND(AVG(gp.ranking), 2) AS avg_ranking
        FROM users u
        LEFT JOIN game_participants gp ON u.id = gp.user_id
        WHERE u.id = ?
        GROUP BY u.id, u.name
    `).bind(userId).first();
    
    // Get faction stats
    const factionStats = await env.DB.prepare(`
        SELECT
            f.id AS faction_id,
            f.name AS faction_name,
            COUNT(gp.id) AS times_played,
            ROUND(COUNT(gp.id) * 100.0 / (
                SELECT COUNT(*) FROM game_participants 
                WHERE user_id = ?
            ), 2) AS pick_rate,
            SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) AS wins,
            ROUND(SUM(CASE WHEN gp.ranking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(gp.id), 2) AS winrate,
            ROUND(AVG(gp.points), 2) AS avg_points,
            ROUND(AVG(gp.ranking), 2) AS avg_ranking
        FROM game_participants gp
        JOIN factions f ON gp.faction_id = f.id
        WHERE gp.user_id = ?
        GROUP BY f.id, f.name
        ORDER BY times_played DESC, wins DESC
    `).bind(userId, userId).all();
    
    // Get recent games
    const recentGames = await env.DB.prepare(`
        SELECT 
            g.id, 
            g.report_date, 
            g.notes,
            gp.ranking,
            gp.points,
            f.id AS faction_id,
            f.name AS faction_name
        FROM games g
        JOIN game_participants gp ON g.id = gp.game_id
        JOIN factions f ON gp.faction_id = f.id
        WHERE gp.user_id = ?
        ORDER BY g.report_date DESC
        LIMIT 10
    `).bind(userId).all();
    
    const result = {
        overall: overallStats,
        factions: factionStats.results,
        recentGames: recentGames.results
    };
    
    return new Response(JSON.stringify(result), responseInit);
}
