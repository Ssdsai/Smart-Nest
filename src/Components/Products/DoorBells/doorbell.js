import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../products.css";
import Box from '../box';

const Doorbells = () => {
  const [boxes, setBoxes] = useState(new Map());
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [accessoryCartStatus, setAccessoryCartStatus] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/backend/loadProducts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const newBoxes = new Map();

        Object.values(data).forEach((product) => {
          if (product.category === 'doorbells') {
            const accessories = Array.isArray(product.accessories) 
              ? product.accessories 
              : Object.entries(product.accessories || {}).map(([name, price]) => ({ name, price }));

            newBoxes.set(product.id, {
              ...product,
              accessories: accessories,
            });
          }
        });
        
        setBoxes(newBoxes);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const storedCartItems = JSON.parse(sessionStorage.getItem("cart")) || [];
    setCartItems(storedCartItems);

    const initializedStatus = Array.from(boxes.keys()).map(() => []);
    const storedAccessoryStatus = JSON.parse(sessionStorage.getItem("accessoryCartStatus")) || initializedStatus;
    setAccessoryCartStatus(storedAccessoryStatus);
  }, [boxes]);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  const handleAddToCartMain = (key) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    const product = boxes.get(key);
    const price = calculatePrice(product.oprice, product.discount);
    const updatedCartItems = [...cartItems];
    const productIndex = updatedCartItems.findIndex(item => item.name === product.name);

    if (productIndex === -1) {
      updatedCartItems.push({ ...product, price: price, quantity: 1 });
    } else {
      updatedCartItems[productIndex].quantity += 1;
      updatedCartItems[productIndex].price = price;
    }

    setCartItems(updatedCartItems);
    sessionStorage.setItem("cart", JSON.stringify(updatedCartItems));
  };

  const handleAddToCartAccessory = (boxKey, accessoryIndex) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  
    const product = boxes.get(boxKey);
  
    // Check if the product and accessories exist
    if (!product || !product.accessories || product.accessories.length === 0) {
      console.error("Product or accessories not found");
      return;
    }
  
    const accessory = product.accessories[accessoryIndex];
    const updatedCartItems = [...cartItems];
    const accessoryInCartIndex = updatedCartItems.findIndex(item => item.name === accessory.name);
  
    // If accessory is not in the cart, add it
    if (accessoryInCartIndex === -1) {
      updatedCartItems.push({ ...accessory, quantity: 1 });
    } else {
      // If it is already in the cart, increase the quantity
      updatedCartItems[accessoryInCartIndex].quantity += 1;
    }
  
    setCartItems(updatedCartItems);
    sessionStorage.setItem("cart", JSON.stringify(updatedCartItems));
  
    // Update accessory cart status
    const updatedAccessoryStatus = accessoryCartStatus.map((status, index) => {
      if (index === Array.from(boxes.keys()).indexOf(boxKey)) {
        const updatedStatus = [...status];
        updatedStatus[accessoryIndex] = true; // Mark this accessory as added
        return updatedStatus;
      }
      return status;
    });    
  
    setAccessoryCartStatus(updatedAccessoryStatus);
    sessionStorage.setItem("accessoryCartStatus", JSON.stringify(updatedAccessoryStatus));
  };
  
  


  const handleReduceQuantityMain = (key) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.name === boxes.get(key).name) {
        if (item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        } else {
          return null; 
        }
      }
      return item;
    }).filter(item => item !== null); 

    setCartItems(updatedCartItems);
    sessionStorage.setItem("cart", JSON.stringify(updatedCartItems));
  };

  const calculatePrice = (oprice, discount) => {
    return discount ? oprice * (1 - discount) : oprice;
  };

  const handleReduceAccessoryQuantity = (boxKey, accessoryIndex) => {
    const product = boxes.get(boxKey);
    const accessory = product.accessories[accessoryIndex];
    const updatedCartItems = cartItems.map((item) => {
      if (item.name === accessory.name) {
        if (item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
        } else {
            return null; 
        }
    }
    return item;
}).filter(item => item !== null);  
  
    setCartItems(updatedCartItems);
    sessionStorage.setItem("cart", JSON.stringify(updatedCartItems));
  
    // Update accessory cart status
    const updatedAccessoryStatus = accessoryCartStatus.map((status, index) => {
      if (index === Array.from(boxes.keys()).indexOf(boxKey)) {
        const updatedStatus = [...status];
        if (updatedCartItems.some(item => item.name === accessory.name)) {
          updatedStatus[accessoryIndex] = true; 
      } else {
          updatedStatus[accessoryIndex] = false; 
      }
      return updatedStatus;
  }
  return status;
});
  
    setAccessoryCartStatus(updatedAccessoryStatus);
    sessionStorage.setItem("accessoryCartStatus", JSON.stringify(updatedAccessoryStatus));
  };
  
  useEffect(() => {
    if (selectedProductIndex !== null) {
      const selectedBox = boxes.get(selectedProductIndex);
      if (selectedBox) {
        selectedBox.accessories.forEach((accessory) => {
          console.log(`Accessory Name: ${accessory.name}, Price: ${accessory.price}`);
        });
      }
    }
  }, [selectedProductIndex, boxes]);

  const handleBoxClick = (key) => {
    setSelectedProductIndex(key === selectedProductIndex ? null : key);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setAccessoryCartStatus(Array.from(boxes.keys()).map(() => []));
      sessionStorage.setItem("accessoryCartStatus", JSON.stringify(Array.from(boxes.keys()).map(() => [])));
    }
  }, [isLoggedIn, boxes]);


  return (
    <div className="products-page">
      <h1>&nbsp;Doorbells<br /></h1>
      <div className="products-grid">
        {boxes.size > 0 ? (
          Array.from(boxes.keys()).map((key) => {
            const box = boxes.get(key);
            const accessoryStatus = accessoryCartStatus[Array.from(boxes.keys()).indexOf(key)] || [];
            const price = calculatePrice(box.oprice, box.discount);
  
            return (
              <Box
              key={key}
              {...box}
              price={price}
              isSelected={selectedProductIndex === key}
              onClick={() => handleBoxClick(key)}
              isMainAddedToCart={cartItems.some((item) => item.name === box.name)}
              onAddToCartMain={() => handleAddToCartMain(key)}
              onReduceQuantityMain={() => handleReduceQuantityMain(key)}
              onAddToCartAccessory={(accessoryIndex) => handleAddToCartAccessory(key, accessoryIndex)}
              onReduceAccessoryQuantity={(accessoryIndex) => handleReduceAccessoryQuantity(key, accessoryIndex)} // Ensure this is passed
              accessoryCartStatus={accessoryStatus}
              accessoryQuantities={box.accessories.map((accessory) => 
                cartItems.find(item => item.name === accessory.name)?.quantity || 0
              )}
            >

                <div className="accessories-container">
                  {box.accessories.map((accessory, accessoryIndex) => {
                    const isAccessoryInCart = cartItems.some(item => item.name === accessory.name);
                    const accessoryQuantity = cartItems.find(item => item.name === accessory.name)?.quantity || 0;
  
                    return (
                      <div key={accessoryIndex} className="accessory-item">
                        {isAccessoryInCart ? (
                          <div className="quantity-incrementer">
                            <button onClick={() => handleReduceAccessoryQuantity(key, accessoryIndex)}>-</button>
                            <span>{accessoryQuantity}</span>
                            <button onClick={() => handleAddToCartAccessory(key, accessoryIndex)}>+</button>
                          </div>
                        ) : (
                          <button onClick={() => handleAddToCartAccessory(key, accessoryIndex)}>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Box>
            );
          })
        ) : (
          <p>Loading products...</p>
        )}
      </div>
    </div>
  );
};

export default Doorbells;
