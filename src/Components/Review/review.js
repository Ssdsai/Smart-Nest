import React, { useState, useEffect } from 'react';

const Review = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [price, setPrice] = useState('');
  const [onsale, setonsale] = useState('');
  const [rebate, setrebate] = useState('');
  const [storeid, setstoreid] = useState([]);
  const [selectedstoreid, setselectedstoreid] = useState('');
  const [storename, setstoreName] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [formData, setFormData] = useState({
    userID: localStorage.getItem('userId') || '',
    userAge: '',
    userGender: 'Male',
    userOccupation: '',
    reviewRating: '',
    reviewText: '',
    manufacturerName: '',
    reviewDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch(`http://localhost:8080/backend/review?action=categories`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text(); // Get the response as plain text
            console.log('Raw Response:', responseText);

            // Split the text into an array by new lines and filter out any empty strings
            const categoriesArray = responseText.split('\n').filter(category => category.trim() !== '');
            setCategories(categoriesArray); // Set the categories state
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchStoreId = async () => {
      try {
          const response = await fetch(`http://localhost:8080/backend/review?action=storeid`);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const responseText = await response.text(); // Get the response as plain text
          console.log('Raw Response:', responseText);

          // Split the text into an array by new lines and filter out any empty strings
          const storeidArray = responseText.split('\n').filter(storeid => storeid.trim() !== '');
          setstoreid(storeidArray); // Set the categories state
      } catch (error) {
          console.error("Error fetching categories:", error);
      }
  };

    fetchCategories();
    fetchStoreId();
}, []);

  

  const handleCategoryChange = async (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedProduct('');
    /*setPrice('');
    setonsale('');
    setrebate('');*/
  
    try {
      const response = await fetch(`http://localhost:8080/backend/review?action=products&categories=${category}`);
      if (!response.ok || response.headers.get('Content-Length') === '0') {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  

  const handleProductChange = async (e) => {
    const productName = e.target.value;
    setSelectedProduct(productName);
  
    try {
      // Fetch product price
      const priceResponse = await fetch(`http://localhost:8080/backend/review?action=product-price&productName=${productName}`);
      if (!priceResponse.ok || priceResponse.headers.get('Content-Length') === '0') {
        const errorText = await priceResponse.text();
        throw new Error(`HTTP error! status: ${priceResponse.status}, body: ${errorText}`);
      }
      const priceData = await priceResponse.json();
      setPrice(priceData.price || '');
  
      // Fetch product onsale status
      const onsaleResponse = await fetch(`http://localhost:8080/backend/review?action=product-onsale&productName=${productName}`);
      if (!onsaleResponse.ok || onsaleResponse.headers.get('Content-Length') === '0') {
        const errorText = await onsaleResponse.text();
        throw new Error(`HTTP error! status: ${onsaleResponse.status}, body: ${errorText}`);
      }
      const onsaleData = await onsaleResponse.json();
      setonsale(onsaleData.onsale || '');
  
      // Fetch product rebate
      const rebateResponse = await fetch(`http://localhost:8080/backend/review?action=product-rebate&productName=${productName}`);
      if (!rebateResponse.ok || rebateResponse.headers.get('Content-Length') === '0') {
        const errorText = await rebateResponse.text();
        throw new Error(`HTTP error! status: ${rebateResponse.status}, body: ${errorText}`);
      }
      const rebateData = await rebateResponse.json();
      setrebate(rebateData.rebate || '');
      
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
    
  };


  const handleStoreChange = async (e) => {
    const storeid = e.target.value;
    setselectedstoreid(storeid);
  
    try {
      // Fetch zip code
      const zipResponse = await fetch(`http://localhost:8080/backend/review?action=store-zip&storeid=${storeid}`);
      if (!zipResponse.ok || zipResponse.headers.get('Content-Length') === '0') {
        const errorText = await zipResponse.text();
        throw new Error(`HTTP error! status: ${zipResponse.status}, body: ${errorText}`);
      }
      const zipData = await zipResponse.json();
      setZip(zipData.zip || '');
  
      // Fetch state
      const stateResponse = await fetch(`http://localhost:8080/backend/review?action=store-state&storeid=${storeid}`);
      if (!stateResponse.ok || stateResponse.headers.get('Content-Length') === '0') {
        const errorText = await stateResponse.text();
        throw new Error(`HTTP error! status: ${stateResponse.status}, body: ${errorText}`);
      }
      const stateData = await stateResponse.json();
      setState(stateData.state || '');
  
      // Fetch city
      const cityResponse = await fetch(`http://localhost:8080/backend/review?action=store-city&storeid=${storeid}`);
      if (!cityResponse.ok || cityResponse.headers.get('Content-Length') === '0') {
        const errorText = await cityResponse.text();
        throw new Error(`HTTP error! status: ${cityResponse.status}, body: ${errorText}`);
      }
      const cityData = await cityResponse.json();
      setCity(cityData.city || '');

      // Fetch Store Name
      const storenameResponse = await fetch(`http://localhost:8080/backend/review?action=store-name&storeid=${storeid}`);
      if (!storenameResponse.ok || storenameResponse.headers.get('Content-Length') === '0') {
        const errorText = await storenameResponse.text();
        throw new Error(`HTTP error! status: ${storenameResponse.status}, body: ${errorText}`);
      }
      const storenameData = await storenameResponse.json();
      setstoreName(storenameData.storename || '');
      
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/backend/review?action=categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...formData,
          productModelName: selectedProduct,
          productCategory: selectedCategory,
          productPrice: price,
          productonsale: onsale,
          productrebate: rebate,
          storeid: selectedstoreid,
          zip: zip,
          state: state,
          city:city,
          storename:storename
        })
      });
      if (response.ok) {
        alert('Review submitted successfully');
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Product Category:</label>
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">Select a category</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
        &nbsp;
      <label>Product Model Name:</label>
      <select value={selectedProduct} onChange={handleProductChange} disabled={!selectedCategory}>
        <option value="">Select a product</option>
        {products.map(product => (
          <option key={product} value={product}>{product}</option>
        ))}
      </select>
      &nbsp;
      <label>Product Price:</label>
      <input type="text" value={price} readOnly />
      &nbsp;
      <label>Product On Sale:</label>
      <input type="text" value={onsale} readOnly />
      &nbsp;

      <label>Store ID:</label>
      <select value={selectedstoreid} name="storeid" onChange={handleStoreChange}>
        <option value="">Select Store ID</option>
        {storeid.map(storeid => (
          <option key={storeid} value={storeid}>{storeid}</option>
        ))}
      </select>
      &nbsp;
      <label>Store Name</label>
      <input type="text" name="storename" value={storename} readOnly />
      &nbsp;
      <label>Store City</label>
      <input type="text" name="city" value={city} readOnly />
      &nbsp;
      <label>Store State</label>
      <input type="text" name="state" value={state} readOnly />
      &nbsp;
      <label>Store Zip</label>
      <input type="text" name="zip" value={zip} readOnly />
      &nbsp;
      <label>Manufacturer Name:</label>
      <input 
        type="text" 
        name="manufacturerName"
        value={formData.manufacturerName}
        onChange={handleInputChange}
        required 
      />
  &nbsp;
      <label>Manufacturer rebate:</label>
      <input type="text" value={rebate} readOnly />
      &nbsp;
      <label>User ID:</label>
      <input type="text" name="userID" value={formData.userID} readOnly />
      &nbsp;
      <label>User Age:</label>
      <input 
        type="number" 
        name="userAge" 
        value={formData.userAge} 
        onChange={handleInputChange} 
        min="0" 
        required 
      />
  &nbsp;
      <label>User Gender:</label>
      <input 
        type="radio" 
        name="userGender" 
        value="Male" 
        checked={formData.userGender === 'Male'} 
        onChange={handleInputChange} 
      /> Male
      <input 
        type="radio" 
        name="userGender" 
        value="Female" 
        checked={formData.userGender === 'Female'} 
        onChange={handleInputChange} 
      /> Female
      <input 
        type="radio" 
        name="userGender" 
        value="Other" 
        checked={formData.userGender === 'Other'} 
        onChange={handleInputChange} 
      /> Other
  &nbsp;
  
      <label>&nbsp;User Occupation:</label>
      <input 
        type="text" 
        name="userOccupation" 
        value={formData.userOccupation} 
        onChange={handleInputChange} 
      />
    &nbsp;
      <label>Review Rating:</label>
      <input 
        type="number" 
        name="reviewRating" 
        value={formData.reviewRating} 
        min="1" 
        max="5" 
        step="0.1" 
        onChange={handleInputChange} 
        required 
      />
      &nbsp;
      <label>Review Date:</label>
      <input type="text" name="reviewDate" value={formData.reviewDate} readOnly />
      &nbsp;
      <label>Review Text:</label>
      <textarea name="reviewText" value={formData.reviewText} onChange={handleInputChange}></textarea>

      <button type="submit">Submit Review</button>
    </form>
  );
};

export default Review;