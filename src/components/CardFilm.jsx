import { useEffect, useState } from 'react';
import styles from './CardFilm.module.css';
import NavBar from './NavBar';

function MovieCard() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await fetch(
          'https://api.themoviedb.org/3/movie/popular?api_key=0aa69a7b940cae954ede32ab15985a1f&language=en-US&page=1'
        );
        const data = await response.json();

        if (!data.results) {
          throw new Error('Invalid API response');
        }

        setMovies(data.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setErrorMessage('Failed to load movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, []);

  const fetchMovieDetails = async (id) => {
    try {
      const detailsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=0aa69a7b940cae954ede32ab15985a1f&language=en-US`
      );
      const detailsData = await detailsResponse.json();

      const trailerResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=0aa69a7b940cae954ede32ab15985a1f&language=en-US`
      );
      const trailerData = await trailerResponse.json();
      const trailer = trailerData.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );

      const castResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=0aa69a7b940cae954ede32ab15985a1f&language=en-US`
      );
      const castData = await castResponse.json();
      const cast = castData.cast.slice(0, 5);

      setMovieDetails({
        ...detailsData,
        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        cast,
      });
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const openModal = (movie) => {
    setSelectedMovie(movie);
    fetchMovieDetails(movie.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
    setMovieDetails(null);
  };

  const handleSearchResults = (results) => {
    setMovies(results);
  };

  const completeMovies = [...movies];
  if (movies.length > 0) {
    while (completeMovies.length < 6) {
      completeMovies.push({ id: `placeholder-${completeMovies.length}`, placeholder: true });
    }
  }

  return (
    <>
      {/* NavBar stays outside the main container */}
      <NavBar onSearch={handleSearchResults} />

      {/* Main content container */}
      <div className={styles.container}>
        <h2 className={styles.title}><strong>Movies</strong></h2>

        {loading ? (
          <p className={styles.title}>Loading movies...</p>
        ) : errorMessage ? (
          <p className={styles.title}>{errorMessage}</p>
        ) : movies.length === 0 ? (
          <div className={styles.grid}>
            <p className={styles.title}>No movies found.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {completeMovies.map((movie) =>
              movie.placeholder ? (
                <div key={movie.id} className={styles.card} style={{ opacity: 0.1 }}></div>
              ) : (
                <div
                  key={movie.id}
                  className={styles.card}
                  onClick={() => openModal(movie)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    className={styles.poster}
                  />
                  <p className={styles.titleCard}>{movie.title}</p>
                </div>
              )
            )}
          </div>
        )}

        {showModal && selectedMovie && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} animate__animated animate__fadeIn`}>
              <button onClick={closeModal} className={styles.close}>✖</button>
              <h2>{selectedMovie.title}</h2>
              {movieDetails && (
                <>
                  <p><strong>Year:</strong> {new Date(movieDetails.release_date).getFullYear()}</p>
                  <p>{movieDetails.overview}</p>
                  {movieDetails.trailerUrl && (
                    <p>
                      <a
                        href={movieDetails.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#ffcc00', textDecoration: 'underline' }}
                      >
                        ▶ Watch Trailer
                      </a>
                    </p>
                  )}
                  <h3 style={{ marginTop: '1rem', color: '#ffcc00' }}>Main Cast</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {movieDetails.cast.map((actor) => (
                      <li key={actor.id}>
                        {actor.name} as <em>{actor.character}</em>
                      </li>
                    ))}
                  </ul>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${selectedMovie.backdrop_path}`}
                    alt={selectedMovie.title}
                    className={styles.modalImage}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MovieCard;