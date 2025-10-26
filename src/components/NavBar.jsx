import { useState, useEffect } from 'react';
import styles from './NavBar.module.css';

function Sidebar({ onSearch }) {
  const [searchInput, setSearchInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchInput.trim() !== '') {
        fetchMovies(searchInput);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const fetchMovies = async (query) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=0aa69a7b940cae954ede32ab15985a1f&language=en-US&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.results) {
        onSearch(data.results);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  return (
    <>
      <button className={styles.menuButton} onClick={() => setIsOpen(true)}>☰</button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>✖</button>
        <h1 className={styles.logo}>🎬 Movie Explorer</h1>
        <input
          type="text"
          placeholder="Search movies..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </>
  );
}

export default Sidebar;