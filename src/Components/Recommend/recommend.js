import React, { useState } from 'react';
import axios from 'axios';
import './recommend.css';

const RecommendProduct = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRecommendation = async () => {
    if (!query.trim()) {
      setError('Please enter a valid query.');
      return;
    }

    setLoading(true);
    setError('');
    setProducts([]); // Clear previous results

    try {
      const response = await axios.post('http://localhost:5000/recommendProduct', { query });

      if (response.status === 200 && response.data.length > 0) {
        setProducts(response.data);
      } else {
        setError(response.data.message || 'No products found.');
      }
    } catch (err) {
      console.error('Error fetching recommended products:', err.message);
      setError('Failed to fetch recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommend-product-container">
      <div className="search-input mb-4">
        <input
          type="text"
          placeholder="Enter product category or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 w-2/3"
        />
        <button
          onClick={handleRecommendation}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Recommend Product
        </button>
      </div>

      {loading && <p className="loading-text">Loading recommendations...</p>}

      {error && <p className="error-text text-red-500">{error}</p>}

      {products.length > 0 && (
        <div className="products-list mt-4">
          <h3 className="text-xl font-semibold mb-2">Recommended Products:</h3>
          <ul>
          {products.map((product, index) => (
          <li key={index} className="border-b p-4">
              <p><strong>Product Name:</strong> {product.product_name}</p>
              <p><strong>Price:</strong> ${Number(product.price).toFixed(2)}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Description:</strong> {product.description}</p>
          </li>
      ))}

          </ul>
        </div>
      )}
    </div>
  );
};

export default RecommendProduct;
