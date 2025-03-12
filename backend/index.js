export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (request.method === "POST" && url.pathname === "/api/report-game") {
            const { player1, player2, winner } = await request.json();
            await env.DB.prepare("INSERT INTO games (player1, player2, winner) VALUES (?, ?, ?)")
                .bind(player1, player2, winner).run();
            return new Response("Game recorded!", { status: 200 });
        } else if (url.pathname === "/api/games") {
            const { results } = await env.DB.prepare("SELECT * FROM games").all();
            return Response.json(results);
        }
        return new Response("Not Found", { status: 404 });
    }
};
