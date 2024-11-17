import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './salesman.css';

const Salesman = () => {
    const navigate = useNavigate(); // Initialize navigate
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderId, setOrderId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');

    // Check if the user is allowed to access this page
    const userEmail = localStorage.getItem('userEmail'); // Adjust this as per your authentication mechanism
    useEffect(() => {
        if (userEmail !== "salesman@smartnest.com") {
            // Redirect to homepage if email does not match
            navigate('/');
        } else {
            fetchOrders(); // Fetch orders if authorized
        }
    }, [userEmail, navigate]); // Add navigate to dependencies
        
      //  fetchOrders();
    //}, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`http://localhost:8080/backend/salesman`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleUpdateClick = async () => {
        try {
            const response = await fetch(`http://localhost:8080/backend/salesman?${orderId}`);
            if (!response.ok) {
                throw new Error('Order not found');
            }
            const order = await response.json();
            setSelectedOrder(order);
            setCustomerName(order.customerName);
            setCustomerAddress(order.customerAddress);
        } catch (error) {
            console.error('Error fetching order:', error);
        }
    };

    const handleSaveClick = async () => {
        try {
            const updatedOrder = { customerName, customerAddress };
            console.log('Sending updated order:', updatedOrder); 
            const response = await fetch(`http://localhost:8080/backend/salesman/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedOrder),
            });
            if (!response.ok) {
                const errorText = await response.text(); // Capture error body
                throw new Error('Error updating order');
            }
            alert('Order updated successfully!');
            fetchOrders(); // Refresh order list
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const handleDeleteClick = async () => {
        try {
            const response = await fetch(`http://localhost:8080/backend/salesman/${orderId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Error deleting order');
            }
            alert('Order deleted successfully!');
            fetchOrders(); // Refresh order list
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    return (
        <div className='salesman'>
            <h1>Salesman Dashboard</h1>
            <table id="ordersTable">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Customer Address</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.orderId}>
                            <td>{order.orderId}</td>
                            <td>{order.customerName}</td>
                            <td>{order.customerAddress}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <input
                    type="text"
                    placeholder="Enter the Order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                />
                <button onClick={handleUpdateClick}>Update</button>
                <button onClick={handleDeleteClick}>Delete</button>
            </div>
            {selectedOrder && (
                <div>
                    <h2>Edit Order</h2>
                    <input
                        type="text"
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Customer Address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        required
                    />
                    <button onClick={handleSaveClick}>Save</button>
                </div>
            )}
            <button onClick={() => (window.location.href = '/')}>Add Order</button>
        </div>
    );
};

export default Salesman;
