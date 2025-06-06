import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: '27a817a01aabd3d0ce006894a11afd7f',
    language: 'es-ES'
  }
});

export default {
  getPopularMovies(page = 1) {
    return api.get('/movie/popular', { params: { page } });
  },

  getTopRatedMovies(page = 1) {
    return api.get('/movie/top_rated', { params: { page } });
  },

  getUpcomingMovies(page = 1) {
    return api.get('/movie/upcoming', { params: { page } });
  },

  getNowPlayingMovies(page = 1) {
    return api.get('/movie/now_playing', { params: { page } });
  },

  searchMovies(query, page = 1) {
    return api.get('/search/movie', {
      params: {
        query,
        page
      }
    });
  },

  getGenres() {
    return api.get('/genre/movie/list');
  },

  getMovieDetails(id) {
    return api.get(`/movie/${id}`);
  },

  // Ajuste para cargar varias páginas de películas
  async getAllMovies(totalPages = 200) {
  let allMovies = [];

  try {
    const pageRequests = [];
    
    // Preparar todas las solicitudes en paralelo
    for (let page = 1; page <= totalPages; page++) {
      pageRequests.push(api.get('/discover/movie', {
        params: {
          sort_by: 'popularity.desc',
          include_adult: false,
          include_video: false,
          page
        }
      }));
    }

    // Ejecutar todas las solicitudes a la vez
    const responses = await Promise.all(pageRequests);

    // Extraer los resultados de cada respuesta
    responses.forEach(response => {
      allMovies.push(...response.data.results);
    });

    console.log(`Total de películas cargadas: ${allMovies.length}`);
    return allMovies;

  } catch (error) {
    console.error("Error al obtener películas:", error);
    return [];
  }
},

  getMoviesByGenre(genreId, page = 1) {
    return api.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        page
      }
    });
  }
};