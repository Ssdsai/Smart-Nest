import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './manager.css'; // Import the external CSS file

const Manager = () => {
  const [action, setAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [boxes, setBoxes] = useState(new Map()); // To manage products
  const navigate = useNavigate(); // Initialize useNavigate

  const userEmail = localStorage.getItem('userEmail'); // Adjust this as per your authentication mechanism
  useEffect(() => {
    if (userEmail !== "manager@smartnest.com") {
      // Redirect to homepage if email does not match
      navigate('/');
    } else {
      navigate('/manager');
    }
  }, [userEmail, navigate]); // Add navigate to dependencies

  const handleAction = (selectedAction) => {
    setAction(selectedAction);
    // Redirect based on action
    if (selectedAction === 'inventory') {
      navigate('/inventory'); // Navigate to Inventory page
    } else if (selectedAction === 'sales') {
      navigate('/sales'); // Navigate to Sales page
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Implement your search logic or API call here
  };

  // Update product price in local state
  const updateProductPrice = (productId, newPrice) => {
    setBoxes((prevBoxes) => {
      const updatedBoxes = new Map(prevBoxes);
      if (updatedBoxes.has(productId)) {
        const product = updatedBoxes.get(productId);
        product.oprice = newPrice; // Update the price directly
        updatedBoxes.set(productId, product);
      }
      return updatedBoxes;
    });
  };

  // Delete product from local state
  const deleteProduct = (productId) => {
    setBoxes((prevBoxes) => {
      const updatedBoxes = new Map(prevBoxes);
      if (updatedBoxes.has(productId)) {
        updatedBoxes.delete(productId); // Remove product from local state
      }
      return updatedBoxes;
    });
  };

  return (
    <div className="container">
      <h2>Product Management Dashboard</h2>

      <div className="buttonContainer">
        <button onClick={() => handleAction('insert')} className="button">Insert Product</button>
        <button onClick={() => handleAction('update')} className="button">Update Product</button>
        <button onClick={() => handleAction('delete')} className="button">Delete Product</button>
        <button onClick={() => handleAction('inventory')} className="button">Inventory Report</button>
        <button onClick={() => handleAction('sales')} className="button">Sales Reports</button>
      </div>

      <div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search..." 
          className="searchInput"
          hidden
        />
        {/* Add your auto-complete dropdown logic here based on the searchTerm */}
      </div>

      <div className="formContainer">
        {action === 'insert' && <InsertForm />}
        {action === 'update' && <UpdateForm updateProductPrice={updateProductPrice} />}
        {action === 'delete' && <DeleteForm deleteProduct={deleteProduct} />}
      </div>
    </div>
  );
};

// Insert Product Form Component
const InsertForm = () => {
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [manufactureRebate, setManufactureRebate] = useState('');
  const [onSale, setOnSale] = useState('no');
  const [accessories, setAccessories] = useState([{ name: '', price: '' }]); // Array to hold accessories

  const handleAccessoryChange = (index, event) => {
    const values = [...accessories];
    values[index][event.target.name] = event.target.value;
    setAccessories(values);
  };

  const handleAddAccessory = () => {
    setAccessories([...accessories, { name: '', price: '' }]);
  };

  const handleRemoveAccessory = (index) => {
    const values = [...accessories];
    values.splice(index, 1);
    setAccessories(values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      category,
      productName,
      imageLink,
      price: parseFloat(price).toFixed(2), // Format to 2 decimal places
      description,
      discount: parseFloat(discount).toFixed(2), // Format to 2 decimal places
      manufactureRebate: parseFloat(manufactureRebate).toFixed(2), // Format to 2 decimal places
      onSale,
      accessories: accessories.map(accessory => ({
        name: accessory.name,
        price: parseFloat(accessory.price).toFixed(2), // Format to 2 decimal places
      })),
    };
    console.log(productData);
    insertProductToXML(productData);
  };

  const insertProductToXML = (product) => {
    fetch('http://localhost:8080/backend/manageProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error('Error inserting product:', error);
      alert('Error inserting product. Please try again.');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Insert Product Form</h3>
      <div>
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>Select Category</option>
          <option value="doorbells">Doorbells</option>
          <option value="doorlocks">Door Locks</option>
          <option value="lights">Lights</option>
          <option value="speakers">Speakers</option>
          <option value="thermostats">Thermostats</option>
        </select>
      </div>

      <div>
        <label>Product Name:</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Image Link:</label>
        <input
          type="text"
          value={imageLink}
          onChange={(e) => setImageLink(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Discount:</label>
        <input
          type="number"
          step="0.01"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          required
          min="0"
        />
      </div>

      <div>
        <label>Manufacture Rebate:</label>
        <input
          type="number"
          step="0.01"
          value={manufactureRebate}
          onChange={(e) => setManufactureRebate(e.target.value)}
          required
          min="0"
        />
      </div>

      <div>
        <label>On Sale:</label>
        <select value={onSale} onChange={(e) => setOnSale(e.target.value)} required>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      <h4>Accessories:</h4>
      {accessories.map((accessory, index) => (
        <div key={index}>
          <input
            type="text"
            name="name"
            placeholder="Accessory Name"
            value={accessory.name}
            onChange={(e) => handleAccessoryChange(index, e)}
            required
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Accessory Price"
            value={accessory.price}
            onChange={(e) => handleAccessoryChange(index, e)}
            required
            min="0"
          />
          <button type="button" onClick={() => handleRemoveAccessory(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddAccessory}>Add Accessory</button>

      <button type="submit">Insert Product</button>
    </form>
  );
};

// Update Product Form Component
const UpdateForm = ({ updateProductPrice }) => {
  const [productId, setProductId] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      product_id: productId, // Corrected key
      newPrice: parseFloat(newPrice), // Convert to number
    };
    
    fetch('http://localhost:8080/backend/updateProductPrice', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.message === "Product price updated successfully.") {
        // Update the price directly in the Manager component
        updateProductPrice(productId, parseFloat(newPrice)); // Call this function
      }
      // Clear inputs after submission
      setProductId('');
      setNewPrice('');
    })
    .catch((error) => {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    });
  };

  return (
    <form onSubmit={handleUpdateSubmit}>
      <h3>Update Product Price</h3>
      <div>
        <label>Product ID:</label>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        />
      </div>

      <div>
        <label>New Price:</label>
        <input
          type="number"
          step="0.01"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          required
          min="0"
        />
      </div>

      <button type="submit">Update Price</button>
    </form>
  );
};

// Delete Product Form Component
const DeleteForm = ({ deleteProduct }) => {
  const [productId, setProductId] = useState('');

  const handleDeleteSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/backend/deleteProduct', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.message === "Product deleted successfully.") {
        // Remove product from local state in Manager
        deleteProduct(productId);
      }
      // Clear input after submission
      setProductId('');
    })
    .catch((error) => {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    });
  };

  return (
    <form onSubmit={handleDeleteSubmit}>
      <h3>Delete Product</h3>
      <div>
        <label>Product ID:</label>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        />
      </div>

      <button type="submit">Delete Product</button>
    </form>
  );
};

export default Manager;



/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './manager.css'; // Import the external CSS file

const Manager = () => {
  const [action, setAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [boxes, setBoxes] = useState(new Map()); // Add this line to manage products
  const navigate = useNavigate(); // Initialize useNavigate

  const userEmail = localStorage.getItem('userEmail'); // Adjust this as per your authentication mechanism
  useEffect(() => {
    if (userEmail !== "manager@smartnest.com") {
      // Redirect to homepage if email does not match
      navigate('/');
    } else {
      navigate('/manager');
    }
  }, [userEmail, navigate]); // Add navigate to dependencies

  const handleAction = (selectedAction) => {
    setAction(selectedAction);
    // Redirect based on action
    if (selectedAction === 'inventory') {
      navigate('/inventory'); // Navigate to Inventory page
    } else if (selectedAction === 'sales') {
      navigate('/sales'); // Navigate to Sales page
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Implement your search logic or API call here
  };

  // Define updateProductPrice
  const updateProductPrice = (productId, newPrice) => {
    setBoxes((prevBoxes) => {
      const updatedBoxes = new Map(prevBoxes);
      if (updatedBoxes.has(productId)) {
        const product = updatedBoxes.get(productId);
        product.oprice = newPrice; // Update the price directly
        updatedBoxes.set(productId, product);
      }
      return updatedBoxes;
    });
  };

  return (
    <div className="container">
      <h2>Product Management Dashboard</h2>

      <div className="buttonContainer">
        <button onClick={() => handleAction('insert')} className="button">Insert Product</button>
        <button onClick={() => handleAction('update')} className="button">Update Product</button>
        <button onClick={() => handleAction('delete')} className="button">Delete Product</button>
        <button onClick={() => handleAction('inventory')} className="button">Inventory Report</button>
        <button onClick={() => handleAction('sales')} className="button">Sales Reports</button>
      </div>

      <div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search..." 
          className="searchInput"
          hidden
        />
        //{ Add your auto-complete dropdown logic here based on the searchTerm }
      </div>

      <div className="formContainer">
        {action === 'insert' && <InsertForm />}
        {action === 'update' && <UpdateForm updateProductPrice={updateProductPrice} />}
        {action === 'delete' && <DeleteForm />}
        //{ Removed inventory and sales report components from here }
      </div>
    </div>
  );
};

// Insert Product Form Component
const InsertForm = () => {
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [manufactureRebate, setManufactureRebate] = useState('');
  const [onSale, setOnSale] = useState('no');
  const [accessories, setAccessories] = useState([{ name: '', price: '' }]); // Array to hold accessories

  const handleAccessoryChange = (index, event) => {
    const values = [...accessories];
    values[index][event.target.name] = event.target.value;
    setAccessories(values);
  };

  const handleAddAccessory = () => {
    setAccessories([...accessories, { name: '', price: '' }]);
  };

  const handleRemoveAccessory = (index) => {
    const values = [...accessories];
    values.splice(index, 1);
    setAccessories(values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      category,
      productName,
      imageLink,
      price: parseFloat(price).toFixed(2), // Format to 2 decimal places
      description,
      discount: parseFloat(discount).toFixed(2), // Format to 2 decimal places
      manufactureRebate: parseFloat(manufactureRebate).toFixed(2), // Format to 2 decimal places
      onSale,
      accessories: accessories.map(accessory => ({
        name: accessory.name,
        price: parseFloat(accessory.price).toFixed(2), // Format to 2 decimal places
      })),
    };
    console.log(productData);
    insertProductToXML(productData);
  };

  const insertProductToXML = (product) => {
    fetch('http://localhost:8080/backend/manageProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error('Error inserting product:', error);
      alert('Error inserting product. Please try again.');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Insert Product Form</h3>
      <div>
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>Select Category</option>
          <option value="doorbells">Doorbells</option>
          <option value="doorlocks">Door Locks</option>
          <option value="lights">Lights</option>
          <option value="speakers">Speakers</option>
          <option value="thermostats">Thermostats</option>
        </select>
      </div>

      <div>
        <label>Product Name:</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Image Link:</label>
        <input
          type="text"
          value={imageLink}
          onChange={(e) => setImageLink(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Discount:</label>
        <input
          type="number"
          step="0.01"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          required
          min="0"
        />
      </div>

      <div>
        <label>Manufacture Rebate:</label>
        <input
          type="number"
          step="0.01"
          value={manufactureRebate}
          onChange={(e) => setManufactureRebate(e.target.value)}
          required
          min="0"
        />
      </div>

      <div>
        <label>On Sale:</label>
        <select value={onSale} onChange={(e) => setOnSale(e.target.value)} required>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      <h4>Accessories:</h4>
      {accessories.map((accessory, index) => (
        <div key={index}>
          <input
            type="text"
            name="name"
            placeholder="Accessory Name"
            value={accessory.name}
            onChange={(e) => handleAccessoryChange(index, e)}
            required
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Accessory Price"
            value={accessory.price}
            onChange={(e) => handleAccessoryChange(index, e)}
            required
            min="0"
          />
          <button type="button" onClick={() => handleRemoveAccessory(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddAccessory}>Add Accessory</button>

      <button type="submit">Insert Product</button>
    </form>
  );
};

// Update Product Form Component
const UpdateForm = ({ updateProductPrice }) => {
  const [productId, setProductId] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      product_id: productId, // Corrected key
      newPrice: parseFloat(newPrice), // Convert to number
    };
    
    fetch('http://localhost:8080/backend/updateProductPrice', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.message === "Product price updated successfully.") {
        // Update the price directly in the Manager component
        updateProductPrice(productId, parseFloat(newPrice)); // Call this function
      }
      // Clear inputs after submission
      setProductId('');
      setNewPrice('');
    })
    .catch((error) => {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    });
  };

  return (
    <form onSubmit={handleUpdateSubmit}>
      <h3>Update Product Price</h3>
      <div>
        <label>Product ID:</label>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        />
      </div>

      <div>
        <label>New Price:</label>
        <input
          type="number"
          step="0.01"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          required
          min="0"
        />
      </div>

      <button type="submit">Update Price</button>
    </form>
  );
};

// Delete Product Form Component
const DeleteForm = () => {
  const [productId, setProductId] = useState('');

  const handleDeleteSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/backend/manageProduct', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      // Clear input after submission
      setProductId('');
    })
    .catch((error) => {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    });
  };

  return (
    <form onSubmit={handleDeleteSubmit}>
      <h3>Delete Product</h3>
      <div>
        <label>Product ID:</label>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        />
      </div>

      <button type="submit">Delete Product</button>
    </form>
  );
};

export default Manager;*/
