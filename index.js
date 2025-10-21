// index.js
export default {
  async fetch(request, env) {
    // Extrai o parâmetro "limit" da URL (ex: ?limit=20)
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '10';

    // Validação simples
    if (limit < 1 || limit > 100) {
      return new Response(JSON.stringify({ error: 'Limit must be between 1 and 100' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Endpoint da Spribe para histórico
    const apiUrl = `https://aviator-next.spribegaming.com/api/rounds/history?limit=${encodeURIComponent(limit)}`;

    // Headers essenciais — incluindo seu token
    const headers = {
      'Accept': 'application/json',
      'Accept-Language': 'pt',
      'Referer': 'https://aviator-next.spribegaming.com/',
      'Origin': 'https://aviator-next.spribegaming.com',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
      // ⚠️ Aqui vai seu token real (você pode atualizar depois)
      'Authorization': 'Bearer f827ee98-1da9-48dc-a77d-5a8f0230a808',
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch from Spribe API', status: response.status }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();

      // Retorna só os multiplicadores (opcional: formatação limpa)
      const cleanData = {
        success: true,
        count: data.results?.length || 0,
        rounds: data.results?.map(r => ({
          id: r.roundId,
          multiplier: r.cashoutMultiplier || r.multiplier,
          timestamp: r.createdAt || null
        })) || []
      };

      return new Response(JSON.stringify(cleanData, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
};
