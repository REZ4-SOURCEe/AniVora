export async function onRequestGet({ env, params, request }) {
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

    const origin = new URL(request.url).origin;
    const subsByEp = {};
    try {
      const { results: subs } = await env.DB.prepare(
        'SELECT s.id, s.episode_id, s.label, s.lang FROM subtitles s JOIN episodes e ON e.id = s.episode_id WHERE e.anime_id = ? ORDER BY s.id'
      ).bind(params.id).all();
      for (const s of subs) (subsByEp[s.episode_id] ||= []).push({ id: s.id, label: s.label, lang: s.lang, url: `${origin}/api/subtitle/${s.id}.vtt` });
    } catch (e) {}

    const episodesWithQualities = episodes.map(ep => {
      let qualities = [];
      try { qualities = JSON.parse(ep.qualities || '[]'); } catch (e) {}
      if (qualities.length === 0 && ep.video_url) {
        qualities = [{ label: '1080p', url: ep.video_url }];
      }
      return {
        id: ep.id,
        num: ep.number,
        season: ep.season,
        title: ep.title,
        duration: ep.duration,
        img: ep.thumb,
        videoUrl: ep.video_url,
        qualities: qualities,
        subtitles: subsByEp[ep.id] || []
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