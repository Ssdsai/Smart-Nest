import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Chart } from 'react-google-charts';

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [dailySalesData, setDailySalesData] = useState([]);
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
    // Fetch sales data
    
    const fetchSalesData = async () => {
      try {
        const response = await fetch('http://localhost:8080/backend/fetchSalesData');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Map product data and calculate total sales
        const updatedSalesData = data.map((item) => ({
          name: item.product_name,
          price: item.price,
          quantity: item.product_sales,
          totalSales: item.product_sales * item.price, // Calculate total sales from quantity
        }));

        setSalesData(updatedSalesData);

        // Prepare chart data
        const chartArray = [['Product Name', 'Total Sales']];
        updatedSalesData.forEach((item) => {
          chartArray.push([item.name, item.totalSales]);
        });
        setChartData(chartArray);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    // Fetch daily sales data
    const fetchDailySalesData = async () => {
      try {
        const response = await fetch('http://localhost:8080/backend/fetchDailySalesData');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const dailyData = await response.json();
        setDailySalesData(dailyData);
      } catch (error) {
        console.error('Error fetching daily sales data:', error);
      }
    };

    fetchSalesData();
    fetchDailySalesData();
  }, []);

  return (
    <div>
      <h2>Sales Reports</h2>

      <h3>All Products Sold</h3>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Number of Items Sold</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td style={{ textAlign: 'center' }}>{product.quantity}</td>
              <td>${product.totalSales.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {chartData.length > 1 && (
        <Chart
          chartType="BarChart"
          width="100%"
          height="400px"
          data={chartData}
          options={{
            title: 'Total Sales per Product',
            chartArea: { width: '50%' },
            hAxis: {
              title: 'Total Sales',
              minValue: 0,
            },
            vAxis: {
              title: 'Product Name',
            },
          }}
        />
      )}

      <h3>Daily Sales Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {dailySalesData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.purchase_date}</td>
              <td>${entry.total_sales.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Sales;
