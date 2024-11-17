import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../products.css";
import Box from '../box';

const Thermostats = () => {
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
          if (product.category === 'thermostats') {
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
      <h1>&nbsp;Thermostats<br /></h1>
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

export default Thermostats;

























/*import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../products.css";
import google from '../../../Images/Thermostats/thermostat.google.jpg';
import echobee from '../../../Images/Thermostats/thermostat.echobee.jpg';
import sensi from '../../../Images/Thermostats/thermostat.sensi.jpg';
import honeywell from '../../../Images/Thermostats/thermostat.honeywell.jpg';
import gecync from '../../../Images/Thermostats/thermostat.gecync.jpg';
import Box from '../box';

const Thermostats = () => {
  const boxes = useMemo(() => new Map([
    [
      'google-thermostat',
      {
        image: google,
        name: 'Google Nest Thermostats',
        oprice: 179.99,
        Discount: 20,
        description: 'Nest Hello is now the Nest Thermostats (wired); no matter which name is on the box, you’ll find the same great product inside',
        accessories: [
          { name: 'Charger', price: 29.99 },
          { name: 'Mounting Kit', price: 19.99 },
          { name: 'Retailer Warranty', price: 9.99 }
        ],
        id: 'google-thermostat',
        product_id: 'thermostats_1',
        category: 'thermostats',
        discount: 0.2,
        manufactureRebate: 10.00,
        discount_display:10.00
        
      }
    ],
    [
      'echobee-thermostat',
      {
        image: echobee,
        name: 'Ecobee Smart Thermostats',
        oprice: 159.99,
        Discount: 0,
        description: 'Your Ecobee thermostats and cameras will ring throughout the house and you can even see and talk to visitors live through your Smart Thermostat Premium.',
        accessories: [
          { name: 'Batteries', price: 20.00 },
          { name: 'Installation Kit', price: 30.00 },
          { name: 'Retailer Warranty', price: 9.99 }
        ],
        id: 'echobee-thermostat',
        product_id: 'thermostats_2',
        category: 'thermostats'
      }
    ],
    [
      'sensi-thermostat',
      {
        image: sensi,
        name: 'Sensi Smart Thermostats',
        oprice: 179.99,
        Discount: 10,
        description: 'Top-rated app guides you through each step of the install using universal Bluetooth technology for easier setup. Works with HVAC equipment found in most homes',
        accessories: [
          { name: 'Charger', price: 29.99 },
          { name: 'Retailer Warranty', price: 9.99 },
          { name: 'Room Sensors', price: 99.99 }
        ],
        id: 'sensi-thermostat',
        category: 'thermostats',
        product_id: 'thermostats_3',
        discount: 0.1,
        discount_display:10.00
      }
    ],
    [
      'honeywell-thermostat',
      {
        image: honeywell,
        name: 'Honeywell Thermostats',
        oprice: 144.99,
        Discount: 0,
        description: 'Provides intelligent heating and cooling management, learning your habits to optimize energy usage and save on utility bills. It also integrates seamlessly with smart home systems',
        accessories: [
          { name: 'Retailer Warranty', price: 9.99 },
          { name: 'Mounting Kit', price: 19.99 }
        ],
        id: 'honeywell-thermostat',
        product_id: 'thermostats_4',
        category: 'thermostats'
      }
    ],
    [
      'godrej-thermostat',
      {
        image: gecync,
        name: 'Godrej CYNC Smart Thermostats',
        oprice: 89.99,
        Discount: 0,
        description: 'Whether at home or on the go, program the smart thermostat for home heat and AC with auto mode, set custom schedules, and turn up the heat or cool down your home with the CYNC app; No bridge or hub required',
        accessories: [
          { name: 'Spare Batteries', price: 25.00 },
          { name: 'Wall Mount', price: 15.00 },
          { name: 'Retailer Warranty', price: 9.99 }
        ],
        id: 'godrej-thermostat',
        product_id: 'thermostats_5',
        category: 'thermostats'
      }
    ]
  ]), []);

  
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [accessoryCartStatus, setAccessoryCartStatus] = useState(Array.from(boxes.keys()).map(() => []));
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const navigate = useNavigate();

  useEffect(() => {
    const storedCartItems = JSON.parse(sessionStorage.getItem("cart")) || [];
    setCartItems(storedCartItems);

    const storedAccessoryStatus = JSON.parse(sessionStorage.getItem("accessoryCartStatus")) || Array.from(boxes.keys()).map(() => []);
    setAccessoryCartStatus(storedAccessoryStatus);
  }, [boxes]);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  const handleBoxClick = (key) => {
    setSelectedProductIndex(key === selectedProductIndex ? null : key);
  };

  const handleAddToCartMain = (key) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const product = boxes.get(key);
    const price = calculateprice(product.oprice, product.discount);
    const updatedCartItems = [...cartItems];
    const productIndex = updatedCartItems.findIndex(item => item.name === product.name);

    console.log('Adding to cart:', product.name, 'Price:', price); // Debugging output

    if (productIndex === -1) {
      updatedCartItems.push({ ...product, price: price, quantity: 1 }); // Set price to discounted price
    } else {
      updatedCartItems[productIndex].quantity += 1; // Increment quantity
      updatedCartItems[productIndex].price = price; // Update price if already in cart
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
    const accessory = product.accessories[accessoryIndex];
    const updatedCartItems = [...cartItems];
    const accessoryInCartIndex = updatedCartItems.findIndex(item => item.name === accessory.name);

    if (accessoryInCartIndex === -1) {
      updatedCartItems.push({ ...accessory, quantity: 1 });
    } else {
      updatedCartItems[accessoryInCartIndex].quantity += 1;
    }

    setCartItems(updatedCartItems);
    sessionStorage.setItem("cart", JSON.stringify(updatedCartItems));

    const updatedAccessoryStatus = accessoryCartStatus.map((status, index) => {
      if (index === Array.from(boxes.keys()).indexOf(boxKey)) {
        const updatedStatus = [...status];
        updatedStatus[accessoryIndex] = true; // Mark accessory as added
        return updatedStatus;
      }
      return status;
    });

    setAccessoryCartStatus(updatedAccessoryStatus);
    sessionStorage.setItem("accessoryCartStatus", JSON.stringify(updatedAccessoryStatus));
  };

  const calculateprice = (oprice, discount) => {
    return discount ? oprice * (1 - discount) : oprice;
  };

  return (
    <div className="products-page">
      <h1>&nbsp;Speakers<br /></h1>
      <div className="products-grid">
        {Array.from(boxes.keys()).map((key) => {
          const box = boxes.get(key);
          const accessoryStatus = accessoryCartStatus[Array.from(boxes.keys()).indexOf(key)] || [];
          const price = calculateprice(box.oprice, box.discount);

          return (
            <Box
              key={key}
              {...box}
              price={price} // Pass the discounted price
              isSelected={selectedProductIndex === key}
              onClick={() => handleBoxClick(key)}
              isMainAddedToCart={cartItems.some((item) => item.name === box.name)}
              onAddToCartMain={() => handleAddToCartMain(key)}
              onAddToCartAccessory={(accessoryIndex) => handleAddToCartAccessory(key, accessoryIndex)}
              accessoryCartStatus={accessoryStatus}
              accessoryQuantities={box.accessories.map((accessory) => 
                cartItems.find(item => item.name === accessory.name)?.quantity || 0
              )}
              id={box.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Thermostats;*/

