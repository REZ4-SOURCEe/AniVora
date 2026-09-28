export async function onRequestGet({ env, params }) {
  try {
    const anime = await env.DB.prepare(
      'SELECT * FROM anime WHERE id = ?'
    ).bind(params.id).first();

    if (!anime) {
      return new Response('Not found', { status: 404 });
    }

    const { results: episodes } = await env.DB.prepare(
      'SELECT * FROM episodes WHERE anime_id = ? ORDER BY season, number'
    ).bind(params.id).all();

    let genres = [];
    try { genres = JSON.parse(anime.genres || '[]'); } catch (e) {}

    const episodesWithQualities = episodes.map(ep => {
      let qualities = [];
      try { qualities = JSON.parse(ep.qualities || '[]'); } catch (e) {}
      if (qualities.length === 0 && ep.video_url) {
        qualities = [{ label: '1080p', url: ep.video_url }];
      }
      return {
        num: ep.number,
        season: ep.season,
        title: ep.title,
        duration: ep.duration,
        img: ep.thumb,
        videoUrl: ep.video_url,
        qualities: qualities
      };
    });

    return Response.json({
      ...anime,
      jp: anime.title_jp,
      img: anime.poster,
      genres: genres,
      episodes: episodesWithQualities
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}