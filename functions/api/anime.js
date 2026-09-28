export async function onRequestGet({ env }) {
  try {
    const { results: animeList } = await env.DB.prepare(
      'SELECT * FROM anime ORDER BY id'
    ).all();

    const { results: allEpisodes } = await env.DB.prepare(
      'SELECT * FROM episodes ORDER BY anime_id, season, number'
    ).all();

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
        num: ep.number,
        title: ep.title,
        duration: ep.duration,
        img: ep.thumb,
        videoUrl: ep.video_url,
        qualities: qualities
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
        studio: 'Unknown',
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