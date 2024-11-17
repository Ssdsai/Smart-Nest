import React, { useState } from 'react';
import axios from 'axios';

const SearchReviews = () => {
  const [query, setQuery] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return; // Don't search if the input is empty
    
    setLoading(true);
    try {
      // Send request to the backend to fetch semantically similar reviews
      const response = await axios.post('http://localhost:5000/searchReviews', { query });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-reviews-container">
      <div className="search-input">
        <input
          type="text"
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={handleSearch}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Search Reviews
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {reviews.length > 0 && (
        <div className="reviews-list mt-4">
          <h3>Matching Reviews:</h3>
          <ul>
            {reviews.map((review, index) => (
              <li key={index} className="border-b p-2">
                <p>{review.text}</p>
                <p><strong>Rating:</strong> {review.rating}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchReviews;
