import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Checkout/checkout.css'; // Assuming you have some styles

const storeLocations = [
  { store_name: 'Cermak Smart Solutions', store_id: 'store_1', store_address: 'Hilton, 123 E Cermak Rd, Chicago, IL', zip: '60616' },
  { store_name: 'La Salle Smart Solutions', store_id: 'store_2', store_address: '203 N La Salle St #125, Chicago, IL', zip: '60601' },
  { store_name: 'Indiana Avenue Smart solutions', store_id: 'store_3', store_address: 'WOMENS PARK AND GARDENS, 1801 S Indiana Ave at, Chicago, IL', zip: '60616' },
  { store_name: 'Halsted Smart Solutions', store_id: 'store_4', store_address: '750 S Halsted St UNIT 214, Chicago, IL', zip: '60607' },
  { store_name: 'Clark St. Smart Solutions', store_id: 'store_5', store_address: '2728 N Clark St, Chicago, IL', zip: '60614' },
  { store_name: 'Erie St. Smart Solutions', store_id: 'store_6', store_address: 'Northwestern Medicine Lavin Pavillion, 259 E Erie St, Chicago, IL', zip: '60611' },
  { store_name: 'Lincoln Avenue Smart Solutions', store_id: 'store_7', store_address: '2600 N Lincoln Ave, Chicago, IL', zip: '60618' },
  { store_name: 'Kingsbury St. Smart Solutions', store_id: 'store_8', store_address: '1550 N Kingsbury St, Chicago, IL', zip: '60642' },
  { store_name: 'State St. Smart Solutions', store_id: 'store_9', store_address: 'Block 37 - Aces, 108 N State St, Chicago, IL', zip: '60602' },
  { store_name: 'Dearborn Smart Solutions', store_id: 'store_10', store_address: '10 S Dearborn St, Chicago, IL', zip: '60603' }
];

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    creditCard: '',
    pickupOption: 'home',
    storeLocation: '',
  });

  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  //eslint
  const [shippingCost, setShippingCost] = useState(25); // Default shipping cost
  const navigate = useNavigate();

  useEffect(() => {
    const storedCartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
    setCartItems(storedCartItems);

    // Calculate delivery date (14 days from now)
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 14);
    setDeliveryDate(delivery.toDateString());

    // Generate a random confirmation number
    setConfirmationNumber(`ORD-${Math.floor(Math.random() * 1000000)}`);
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate('/login'); // Redirect to login page if not logged in
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Calculate total price based on cart items and their quantities
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : 0; // Ensure it's a number
    return acc + (price * (item.quantity || 0)); // Safely handle undefined quantity
  }, 0);

  // Update shipping cost based on pickup option
  const finalShippingCost = formData.pickupOption === 'home' ? shippingCost : 0;
  const finalTotal = totalPrice + finalShippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user_id = localStorage.getItem('userId'); // Assuming user ID is stored in local storage
    const customer_name = formData.name;
    const customer_address = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zip}`;
    const credit_card_number = formData.creditCard;
    const order_id = confirmationNumber; // Use generated confirmation number
    const purchase_date = new Date(); // Current date
    const ship_date = deliveryDate; // Delivery date calculated earlier
    const storeLocation = formData.pickupOption === 'store' ? formData.storeLocation : '';
    const store = storeLocations.find((loc) => loc.store_id === storeLocation) || {};
    console.log(storeLocation);
    const store_id = store.store_id || null;
    const store_address = store.store_address ? `${store.store_address}, ${store.zip}` : null;
    console.log(store_id, store_address)
    const sales = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0); // Total quantity calculation

    const orderData = {
      user_id,
      customer_name,
      customer_address,
      credit_card_number,
      order_id,
      purchase_date,
      ship_date,
      cart_items: cartItems.map(item => ({
        product_id: item.product_id,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0
      })),
      total_sales: sales,
      shipping_cost: finalShippingCost,
      store_id,
      store_address
    };

    console.log(orderData);

    try {
      const response = await fetch('http://localhost:8080/backend/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      if (result.status === 'success') {
        alert(`Order placed! Confirmation Number: ${confirmationNumber}. Delivery/Pickup Date: ${deliveryDate}`);
        sessionStorage.removeItem('cart');
        navigate('/');
      } else {
        alert('Order failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Order failed. Please try again.');
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="cart-items">
        {cartItems.map((item, index) => (
          <div key={index} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div>
              <h2>{item.name}</h2>
              <p>Price: ${item.price ? item.price.toFixed(2) : 'N/A'}</p> {/* Safe handling of price */}
              <p>Quantity: {item.quantity}</p> {/* Display quantity */}
            </div>
          </div>
        ))}
      </div>
      <h2>Total: ${totalPrice.toFixed(2)}</h2> {/* Display total price */}

      <form onSubmit={handleSubmit}>
        <h2>Personal Information</h2>
        <label>
          Name:
          <input type="text" placeholder="Enter the name for your Delivery" name="name" value={formData.name} onChange={handleInputChange} required />
        </label>
        <label>
          Address:
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
        </label>
        <label>
          City:
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
        </label>
        <label>
          State:
          <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
        </label>
        <label>
          Zip-Code:
          <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} required />
        </label>
        <label>
          Credit Card:
          <input type="text" name="creditCard" value={formData.creditCard} onChange={handleInputChange} required />
        </label>
        <label>
          Pickup Option:
          <select name="pickupOption" value={formData.pickupOption} onChange={handleInputChange}>
            <option value="home">Home Delivery</option>
            <option value="store">In-Store Pickup</option>
          </select>
        </label>
        {formData.pickupOption === 'store' && (
          <label>
            Store Location:
            <select name="storeLocation" value={formData.storeLocation} onChange={handleInputChange} required>
              <option value="">Select a store</option>
              {storeLocations.map((store) => (
                <option key={store.store_id} value={store.store_id}>
                  {store.store_name}, {store.store_address} - {store.zip}
                </option>
              ))}
            </select>
          </label>
        )}
        
        {/* Display shipping cost and final total above the Place Order button */}
        {formData.pickupOption === 'home' && <h3>Shipping Cost: $25.00</h3>} {/* Display shipping cost if applicable */}
        <h2>Final Total: ${finalTotal.toFixed(2)}</h2>
        
        <button type="submit">Place Order</button>
      </form>
      {confirmationNumber && <div>Confirmation Number: {confirmationNumber}</div>}
      {deliveryDate && <div>Delivery/Pickup Date: {deliveryDate}</div>}
    </div>
  );
};

export default Checkout;











/*
{ name: 'Store 1', store_id: '1', store_address: 'Hilton, 123 E Cermak Rd, Chicago, IL', zip: '60616' },
  { name: 'Store 2', store_id: '2', store_address: '203 N La Salle St #125, Chicago, IL', zip: '60601' },
  { name: 'Store 3', store_id: '3', store_address: 'WOMENS PARK AND GARDENS, 1801 S Indiana Ave at, Chicago, IL', zip: '60616' },
  { name: 'Store 4', store_id: '4', store_address: '750 S Halsted St UNIT 214, Chicago, IL', zip: '60607' },
  { name: 'Store 5', store_id: '5', store_address: '2728 N Clark St, Chicago, IL', zip: '60614' },
  { name: 'Store 6', store_id: '6', store_address: 'Northwestern Medicine Lavin Pavillion, 259 E Erie St, Chicago, IL', zip: '60611' },
  { name: 'Store 7', store_id: '7', store_address: '2600 N Lincoln Ave, Chicago, IL', zip: '60618' },
  { name: 'Store 8', store_id: '8', store_address: '1550 N Kingsbury St, Chicago, IL', zip: '60642' },
  { name: 'Store 9', store_id: '9', store_address: 'Block 37 - Aces, 108 N State St, Chicago, IL', zip: '60602' },
  { name: 'Store 10', store_id: '10', store_address: '10 S Dearborn St, Chicago, IL', zip: '60603' }
   */