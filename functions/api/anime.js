export async function onRequestGet({ env, request }) {
  try {
    const { results: animeList } = await env.DB.prepare(
      'SELECT * FROM anime ORDER BY id'
    ).all();

    const { results: allEpisodes } = await env.DB.prepare(
      'SELECT * FROM episodes ORDER BY anime_id, season, number'
    ).all();

    // زیرنویس‌ها (بدون متن؛ فقط آدرس). اگر جدول هنوز ساخته نشده، نادیده گرفته می‌شود.
    const origin = new URL(request.url).origin;
    const subsByEp = {};
    try {
      const { results: subs } = await env.DB.prepare('SELECT id, episode_id, label, lang FROM subtitles ORDER BY id').all();
      for (const s of subs) (subsByEp[s.episode_id] ||= []).push({ id: s.id, label: s.label, lang: s.lang, url: `${origin}/api/subtitle/${s.id}.vtt` });
    } catch (e) {}

    // گروه‌بندی قسمت‌ها بر اساس anime_id و season
    const episodesByAnime = {};
    for (const ep of allEpisodes) {
      if (!episodesByAnime[ep.anime_id]) episodesByAnime[ep.anime_id] = {};
      if (!episodesByAnime[ep.anime_id][ep.season]) episodesByAnime[ep.anime_id][ep.season] = [];

      let qualities = [];
      try { qualities = JSON.parse(ep.qualities || '[]'); } catch (e) {}
      if (qualities.length === 0 && ep.video_url) {
        qualities = [{ label: '1080p', url: ep.video_url }];
      }

      episodesByAnime[ep.anime_id][ep.season].push({
        id: ep.id,
        num: ep.number,
        title: ep.title,
        duration: ep.duration,
        img: ep.thumb,
        videoUrl: ep.video_url,
        qualities: qualities,
        subtitles: subsByEp[ep.id] || []
      });
    }

    // ساخت ساختار نهایی
    const fullData = animeList.map(anime => {
      const seasonsObj = episodesByAnime[anime.id] || {};
      const seasonNumbers = Object.keys(seasonsObj).map(Number).sort((a, b) => a - b);

      const seasons = seasonNumbers.map(seasonNum => ({
        seasonNumber: seasonNum,
        title: `Season ${seasonNum}`,
        episodesAired: seasonsObj[seasonNum].length,
        episodes: seasonsObj[seasonNum]
      }));

      let genres = [];
      try { genres = JSON.parse(anime.genres || '[]'); } catch (e) {}

      return {
        id: anime.id,
        title: anime.title,
        jp: anime.title_jp,
        description: anime.description,
        img: anime.poster,
        backdrop: anime.backdrop,
        score: anime.score,
        year: anime.year,
        status: anime.status,
        type: anime.type,
        genres: genres,
        eps: seasons.reduce((sum, s) => sum + s.episodes.length, 0),
        episodesAired: seasons.reduce((sum, s) => sum + s.episodesAired, 0),
        duration: '24 min',
        studio: anime.studio || 'Unknown',
        director: anime.director || '',
        writer: anime.writer || '',
        seasons: seasons
      };
    });

    return new Response(JSON.stringify(fullData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}