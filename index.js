// index.js - Worker para histórico do Aviator no Placard (Spribe)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '10';

    // Validação simples
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const apiUrl = `https://aviator-next.spribegaming.com/api/rounds/history?limit=${limitNum}`;

    const headers = {
      'Accept': 'application/json',
      'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://aviator-next.spribegaming.com/',
      'Origin': 'https://aviator-next.spribegaming.com',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Authorization': 'Bearer d7b76299-26ec-4087-9cb0-3ad9e0e600af', // ✅ TOKEN NOVO!
      'Content-Type': 'application/json',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      // Verifica se a resposta é HTML (erro comum)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const preview = await response.text();
        return new Response(JSON.stringify({
          error: 'Received HTML (likely login page or error). Token may be invalid or headers missing.',
          preview: preview.substring(0, 300)
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!response.ok) {
        return new Response(JSON.stringify({
          error: 'API request failed',
          status: response.status,
          statusText: response.statusText
        }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();

      // Formata a resposta
      const cleanData = {
        success: true,
        count: data.results?.length || 0,
        rounds: (data.results || []).map(r => ({
          id: r.roundId || r.id,
          multiplier: r.cashoutMultiplier || r.multiplier || null,
          timestamp: r.createdAt || null
        }))
      };

      return new Response(JSON.stringify(cleanData, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: 'Exception in Worker',
        message: err.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
};
