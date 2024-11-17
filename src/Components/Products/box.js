import React, { useState } from 'react';
import '../Products/products.css'; // Ensure to import CSS for styling

const Box = ({
  image,
  name,
  oprice,
  price,
  Discount,
  discount_display,
  manufactureRebate,
  description,
  accessories = [],
  id,
  isSelected,
  onClick,
  isMainAddedToCart,
  onAddToCartMain,
  onAddToCartAccessory,
  onReduceQuantityMain,
  onReduceAccessoryQuantity,
  accessoryCartStatus = [],
  accessoryQuantities = [], // Add this prop to track accessory quantities
}) => {
  const [quantity, setQuantity] = useState(0); // Track quantity for the main item

  // Function to handle adding main item to cart
  const handleAddToCartMain = (e) => {
    e.stopPropagation();
    if (quantity === 0) {
      setQuantity(1); // Set to 1 when first added
    } else {
      setQuantity(prev => prev + 1); // Increment if already in cart
    }
    onAddToCartMain(); // Call the prop function to add main item to cart
  };

  const formatPrice = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 'Invalid price' : `$${num.toFixed(2)}`;
  };

  return (
    <div id={id} className={`box ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <img src={image} alt={name} className="box-image" />
      <div className="box-name">{name}</div>
      <div className="box-price">{formatPrice(price)}</div>
      {Discount > 0 && (
        <div className="box-price">
          {Discount}% <del>{formatPrice(oprice)}</del>
        </div>
      )}
      {discount_display && (
        <div className="box-price">
          <h3>Discount: {discount_display.toFixed(2)}%</h3>
        </div>
      )}
      {manufactureRebate > 0 && (
        <div className="box-price">
          <p>Manufacture Rebate: {manufactureRebate.toFixed(2)}%</p>
        </div>
      )}
      <div className="box-description">{description}</div>

      <div className="quantity-controls">
        {quantity > 0 ? ( // Check if the main item is added to cart
          <>
            <button className="quantity-button" onClick={(e) => {
              e.stopPropagation();
              setQuantity(prev => prev + 1); // Increment if already in cart
            }}>
              +
            </button>
            <span>{quantity}</span>
            <button className="quantity-button" onClick={(e) => {
              e.stopPropagation();
              if (quantity > 1) {
                setQuantity(prev => prev - 1); // Decrement if more than 1
              } else {
                setQuantity(0); // Reset to 0 if it reaches 0
              }
              onReduceQuantityMain(); // Call the prop function to reduce quantity in cart
            }}>
              -
            </button>
          </>
        ) : (
          <button className="add-to-cart-button-main" onClick={(e) => {
            e.stopPropagation();
            handleAddToCartMain(e); // Handle adding main item to cart
          }}>
            Add to Cart
          </button>
        )}
      </div>

      {isSelected && accessories.length > 0 && (
        <div className="box-accessories">
          <div className="accessories-grid">
            {accessories.map((accessory, index) => (
              <div key={index} className={`accessory ${accessoryCartStatus[index] ? 'added' : ''}`}>
                <div className="accessory-name">{accessory.name}</div>
                <div className="accessory-price">{formatPrice(accessory.price)}</div>
                <div className="accessory-cart-status">
                  {accessoryCartStatus[index] ? (
                    <>
                      <button 
                        className="quantity-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCartAccessory(index); // Increment quantity
                        }}>
                        +
                      </button>
                      <span>{accessoryQuantities[index]}</span> {/* Use accessoryQuantities here */}
                      <button 
                        className="quantity-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onReduceAccessoryQuantity(index); // Reduce quantity
                        }}>
                        -
                      </button>
                    </>
                  ) : (
                    <button 
                      className="add-to-cart-button-accessory" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCartAccessory(index); // Add accessory to cart
                      }}>
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Box;



































/*import React from 'react';
import '../Products/products.css'; // Ensure to import CSS for styling

const Box = ({
  id,
  image,
  name,
  price,
  oprice,
  Discount,
  discount_display,
  manufactureRebate,
  description,
  accessories = [], // Default value for accessories
  isSelected,
  onClick,
  onAddToCartMain,
  onAddToCartAccessory,
  isMainAddedToCart,
  accessoryCartStatus,
  accessoryQuantities,
}) => {
  
  // Function to format the price
  const formatPrice = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  console.log('Accessories:', accessories);
  
  return (
    <div id={id} className={`box ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <img src={image} alt={name} className="box-image" />
      <div className="box-name">{name}</div>
      <div className="box-price">{formatPrice(price)}</div>
      {Discount > 0 && (
        <div className="box-price">
          {Discount}% <del>{formatPrice(oprice)}</del>
        </div>
      )}
      {discount_display && (
        <div className="box-price">
          <h3>Discount: {discount_display.toFixed(2)}%</h3>
        </div>
      )}
      {manufactureRebate > 0 && (
        <div className="box-price">
          <p>Manufacture Rebate: {manufactureRebate.toFixed(2)}%</p>
        </div>
      )}
      <div className="box-description">{description}</div>
      {Array.isArray(accessories) && accessories.length > 0 && (
        <div className="accessory-section">
          {accessories.map((accessory, index) => (
            <div key={index} className="accessory-item">
              <span>{accessory.name} - {formatPrice(accessory.price)}</span>
              <button onClick={() => onAddToCartAccessory(index)} disabled={accessoryCartStatus[index]}>
                {accessoryCartStatus[index] ? 'Added' : 'Add to Cart'}
              </button>
              <span>Quantity: {accessoryQuantities[index]}</span>
            </div>
          ))}
        </div>
      )}
      <div className="quantity-controls">
        {isMainAddedToCart ? (
          <button className="add-to-cart-btn" onClick={onAddToCartMain}>
            Added to Cart
          </button>
        ) : (
          <button className="add-to-cart-btn" onClick={onAddToCartMain}>
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default Box;*/






/*import React, { useState } from 'react';
import "../Products/products.css";

const Box = ({
  image,
  name,
  oprice,
  price, // Updated to accept price
  Discount,
  discount_display,
  manufactureRebate,
  description,
  accessories = [],
  id,
  isSelected,
  onClick,
  isMainAddedToCart,
  onAddToCartMain,
  onAddToCartAccessory,
  accessoryCartStatus = [],
  initialQuantity = 1,
  accessoryQuantities = [],
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [localAccessoryQuantities, setLocalAccessoryQuantities] = useState(accessoryQuantities);

  const onReduceQuantityMain = () => {
    if (quantity > 0) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const onReduceAccessoryQuantity = (index) => {
    if (localAccessoryQuantities[index] > 0) {
      const updatedQuantities = [...localAccessoryQuantities];
      updatedQuantities[index]--; 
      setLocalAccessoryQuantities(updatedQuantities);
      onAddToCartAccessory(index);
    }
  };

  const formatPrice = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 'Invalid price' : `$${num.toFixed(2)}`;
  };

  return (
    <div id={id} className={`box ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <img src={image} alt={name} className="box-image" />
      <div className="box-name">{name}</div>
      <div className="box-price">{formatPrice(price)}</div>
      <div className="box-price">{Discount}% <del>{formatPrice(oprice)}</del></div>
      <div className="box-price">{discount_display && <h3>Discount: {discount_display.toFixed(2)}%</h3>}</div>
      <div className="box-price">{manufactureRebate && <p>Manufacture Rebate: {manufactureRebate.toFixed(2)}%</p>}</div>
      <div className="box-description">{description}</div>

      <div className="quantity-controls">
        {isMainAddedToCart ? (
          <>
            <button className="quantity-button" onClick={(e) => {
              e.stopPropagation();
              onAddToCartMain();
              setQuantity(prev => prev + 1);
            }}>
              +
            </button>
            <span>{quantity}</span>
            <button className="quantity-button" onClick={(e) => {
              e.stopPropagation();
              onReduceQuantityMain();
            }}>
              -
            </button>
          </>
        ) : (
          <button className="add-to-cart-button-main" onClick={(e) => {
            e.stopPropagation();
            onAddToCartMain();
          }}>
            Add to Cart
          </button>
        )}
      </div>

      {isSelected && (
        <div className="box-accessories">
          <div className="accessories-grid">
            {accessories.map((accessory, index) => (
              <div key={index} className={`accessory ${accessoryCartStatus[index] ? 'added' : ''}`}>
                <div className="accessory-name">{accessory.name}</div>
                <div className="accessory-price">{formatPrice(accessory.price)}</div>
                <div className="accessory-cart-status">
                  {accessoryCartStatus[index] ? (
                    <>
                      <button className="quantity-button" onClick={(e) => {
                        e.stopPropagation();
                        onAddToCartAccessory(index);
                        setLocalAccessoryQuantities(prev => {
                          const newQuantities = [...prev];
                          newQuantities[index] = newQuantities[index] + 1; 
                          return newQuantities;
                        });
                      }}>
                        +
                      </button>
                      <span>{localAccessoryQuantities[index]}</span>
                      <button className="quantity-button" onClick={(e) => {
                        e.stopPropagation();
                        onReduceAccessoryQuantity(index);
                      }}>
                        -
                      </button>
                    </>
                  ) : (
                    <button className="add-to-cart-button-accessory" onClick={(e) => {
                      e.stopPropagation();
                      onAddToCartAccessory(index);
                      setLocalAccessoryQuantities(prev => {
                        const newQuantities = [...prev];
                        newQuantities[index] = 1; 
                        return newQuantities;
                      });
                    }}>
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Box;*/
