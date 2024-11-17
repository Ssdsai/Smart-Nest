import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Chart } from 'react-google-charts';
import './inventory.css'; // Import your CSS file


const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  const userEmail = localStorage.getItem('userEmail'); // Adjust this as per your authentication mechanism
    useEffect(() => {
        if (userEmail !== "manager@smartnest.com") {
            // Redirect to homepage if email does not match
            navigate('/');
        } else {
            
        }
    }, [userEmail, navigate]); // Add navigate to dependencies

  useEffect(() => {
    // Fetch product data from the server
    fetch('http://localhost:8080/backend/fetchProducts')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Map product data and calculate available and remaining items
        const updatedProducts = data.map(product => {
          const availableItems = Math.floor(Math.random() * 100) + 50; // Random availability (50 to 149)
          const remainingItems = availableItems - product.productSales; // Remaining items
          return {
            name: product.productName,
            price: product.price,
            available: availableItems,
            remaining: remainingItems,
            onSale: product.onSale,
            rebate: product.rebate > 0 ? 'Yes' : 'No'
          };
        });
        setProducts(updatedProducts);

        // Prepare chart data
        const chartArray = [['Product Name', 'Remaining Items']];
        updatedProducts.forEach(product => {
          chartArray.push([product.name, product.remaining]);
        });
        setChartData(chartArray);
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  return (
    <div>
      <h2>Inventory Report</h2>
      
      {/* Table of all products */}
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Available No Of Items</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td style={{ textAlign: 'center' }}>{product.available}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bar Chart of remaining items */}
      {chartData.length > 1 && (
        <Chart
          chartType="BarChart"
          width="100%"
          height="1100px"
          data={chartData}
          class='chart'
          options={{
            title: 'Remaining Items in Inventory',
            chartArea: { width: '70%' },
            hAxis: {
              title: 'Remaining Items',
              minValue: 0,
            },
            vAxis: {
              title: 'Product Name',
            },
          }}
        />
      )}

      {/* Table for products on sale */}
      <h3>Products on Sale</h3>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.filter(product => product.onSale === 'yes').map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table for products with rebates */}
      <h3>Products with Manufacturer Rebates</h3>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Rebate</th>
          </tr>
        </thead>
        <tbody>
          {products.filter(product => product.rebate === 'Yes').map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.rebate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
