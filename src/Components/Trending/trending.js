import React, { useEffect, useState } from 'react';
import './trending.css';

const Trending = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [topZipCodes, setTopZipCodes] = useState([]);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);

  useEffect(() => {
    fetchTopProducts();
    fetchTopZipCodes();
    fetchMostSoldProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/backend/trending?action=top-products`);
      const text = await response.text();  // Get response as text
      if (text) {
        const data = JSON.parse(text);  // Only parse if text is not empty
        setTopProducts(data);
      } else {
        console.warn('No data received for top products');
        setTopProducts([]);  // Set empty array if no data
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  const fetchTopZipCodes = async () => {
    try {
      const response = await fetch(`http://localhost:8080/backend/trending?action=top-zipcodes`);
      const text = await response.text();  // Get response as text
      if (text) {
        const data = JSON.parse(text);  // Only parse if text is not empty
        setTopZipCodes(data);
      } else {
        console.warn('No data received for top zip codes');
        setTopZipCodes([]);  // Set empty array if no data
      }
    } catch (error) {
      console.error('Error fetching top zip codes:', error);
    }
  };

  const fetchMostSoldProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/backend/trending?action=most-sold-products`);
      const text = await response.text();  // Get response as text
      if (text) {
        const data = JSON.parse(text);  // Only parse if text is not empty
        setMostSoldProducts(data);
      } else {
        console.warn('No data received for most sold products');
        setMostSoldProducts([]);  // Set empty array if no data
      }
    } catch (error) {
      console.error('Error fetching most sold products:', error);
    }
  };

  return (
    <div className="trending-container">
      <h1>Trending Products</h1>

      <h2>Top 5 Most Liked Products</h2>
      <ul>
        {topProducts.map((product, index) => (
          <li key={index}>
            <strong>Product Name:</strong> {product.productModelName} <br />
            <strong>Product Price:</strong> {product.productPrice} <br />
            <strong>Review Rating:</strong> {product.reviewRating}
          </li>
        ))}
      </ul>

      <h2>Top 5 Zip Codes with Maximum Products Sold</h2>
      <ul>
        {topZipCodes.map((zip, index) => (
          <li key={index}>
            <strong>Zip Code:</strong> {zip.zipCode}, &nbsp;
            <strong>Total Sales:</strong> {Number.isInteger(zip.totalSales) ? zip.totalSales : zip.totalSales.toFixed(2)}
          </li>
        ))}
      </ul>

      <h2>Top 5 Most Sold Products</h2>
      <ul>
        {mostSoldProducts.map((product, index) => (
          <li key={index}>
            <strong>Product Name:</strong> {product.productName} <br />
            <strong>Total Sales:</strong> {Number.isInteger(product.totalSales) ? product.totalSales : product.totalSales.toFixed(2)}
          </li>
        ))}
      </ul>


    </div>
  );
};

export default Trending;
