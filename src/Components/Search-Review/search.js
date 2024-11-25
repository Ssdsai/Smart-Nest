import React, { useState } from 'react';
import axios from 'axios';
import "./search.css";

const SearchReviews = () => {
  const [query, setQuery] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError('');
    setReviews([]); // Clear previous results

    try {
      // Send request to the backend to fetch matching reviews
      const response = await axios.post('http://localhost:5000/searchReview', { query });
      
      if (response.status === 200 && response.data.length > 0) {
        setReviews(response.data);
      } else {
        setError('No reviews found matching the query.');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
      setError('Failed to fetch reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-reviews-container">
      <div className="search-input mb-4">
        <input
          type="text"
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 w-2/3"
        />
        <button
          onClick={handleSearch}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Search Reviews
        </button>
      </div>

      {loading && <p className="loading-text">Loading matching reviews...</p>}

      {error && <p className="error-text text-red-500">{error}</p>}

      {reviews.length > 0 && (
        <div className="reviews-list mt-4">
          <h3 className="text-xl font-semibold mb-2">Matching Reviews:</h3>
          <ul>
            {reviews.map((review, index) => (
              <li key={index} className="border-b p-4">
                <p><strong>Review:</strong> {review['Review Text']}</p>
                <p><strong>Rating:</strong> {review['Review Rating']}</p>
                <p><strong>Product:</strong> {review['Product Model Name']}</p>
                <p><strong>Category:</strong> {review['Product Category']}</p>
                <p><strong>Price:</strong> ${review['Product Price'].toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchReviews;
