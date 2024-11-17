import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Retrieve email from local storage
  const email = localStorage.getItem('userEmail'); 

  useEffect(() => {
    if (!email) {
      navigate('/login'); // Redirect to login if no email is found
    } else {
      fetchOrders(email);
    }
  }, [email, navigate]);

  const fetchOrders = async (email) => {
    try {
      const response = await fetch('http://localhost:8080/backend/OrderServlet.txt');
      const data = await response.text();

      // Split data into individual orders
      const ordersArray = data.split('-----').map(order => order.trim()).filter(order => order.length > 0);

      // Parse each order
      const parsedOrders = ordersArray.map(order => {
        const lines = order.split('\n');
        const orderEmail = lines.find(line => line.startsWith('Email:')).replace('Email: ', '').trim();
        const confirmationNumber = lines.find(line => line.startsWith('Confirmation Number:')).replace('Confirmation Number: ', '').trim();
        const deliveryMode = lines.find(line => line.startsWith('Delivery Mode:')).replace('Delivery Mode: ', '').trim();
        const cartItemsLine = lines.find(line => line.startsWith('Cart Items:')).replace('Cart Items: ', '').trim();
        const deliveryDate = lines.find(line => line.startsWith('Delivery Date:')).replace('Delivery Date: ', '').trim();

        // Extract items from cart
        const items = cartItemsLine.split(';').map(item => {
          const [itemDetails, price] = item.split('Price:');
          return {
            itemName: itemDetails.replace('Item: ', '').trim(),
            price: price.trim()
          };
        });

        return {
          orderEmail,
          confirmationNumber,
          deliveryMode,
          items,
          deliveryDate
        };
      });

      // Filter orders based on logged-in user's email
      const userOrders = parsedOrders.filter(order => order.orderEmail === email);
      setOrders(userOrders);
    } catch (error) {
      setError('Failed to fetch orders.');
    }
  };

  const handleCancelOrder = (confirmationNumber) => {
    // Handle order cancellation logic here
    console.log(`Order with confirmation number ${confirmationNumber} canceled.`);
  };

  return (
    <div className="order-status">
      <h1>Your Orders</h1>
      {error && <p className="error-message">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="order">
            <h2>Order Details</h2>
            <p><strong>Confirmation Number:</strong> {order.confirmationNumber}</p>
            <p><strong>Delivery Date:</strong> {order.deliveryDate}</p>
            <p><strong>Delivery Mode:</strong> {order.deliveryMode}</p>
            <h3>Items:</h3>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>{item.itemName} - {item.price}</li>
              ))}
            </ul>
            <button onClick={() => handleCancelOrder(order.confirmationNumber)}>Cancel</button>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderStatus;
