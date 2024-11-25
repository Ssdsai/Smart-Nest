CREATE TABLE IF NOT EXISTS UserDetails (
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    PRIMARY KEY (user_id) -- Make user_id the primary key
);

CREATE TABLE IF NOT EXISTS Orders (
    order_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_address VARCHAR(255) NOT NULL,
    credit_card_number VARCHAR(16) NOT NULL, -- Consider encryption for sensitive data
    purchase_date DATETIME NOT NULL,
    ship_date DATETIME,
    product_id VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2),
    discount DECIMAL(10, 2) DEFAULT 0,
    total_sales DECIMAL(10, 2) NOT NULL,
    store_id VARCHAR(255),
    store_address VARCHAR(255),
    PRIMARY KEY (order_id), -- Make order_id the primary key
    FOREIGN KEY (user_id) REFERENCES UserDetails(user_id) -- Reference to UserDetails
);

CREATE TABLE IF NOT EXISTS StoreLocations (
    store_id VARCHAR(255) NOT NULL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL
);

INSERT IGNORE INTO StoreLocations (store_id, store_name, street, city, state, zip_code) VALUES
('store_1', 'Store 1', '123 E Cermak Rd', 'Chicago', 'IL', '60616'),
('store_2', 'Store 2', '203 N La Salle St #125', 'Chicago', 'IL', '60601'),
('store_3', 'Store 3', 'WOMENS PARK AND GARDENS, 1801 S Indiana Ave at', 'Chicago', 'IL', '60616'),
('store_4', 'Store 4', '750 S Halsted St UNIT 214', 'Chicago', 'IL', '60607'),
('store_5', 'Store 5', '2728 N Clark St', 'Chicago', 'IL', '60614'),
('store_6', 'Store 6', 'Northwestern Medicine Lavin Pavilion, 259 E Erie St', 'Chicago', 'IL', '60611'),
('store_7', 'Store 7', '2600 N Lincoln Ave', 'Chicago', 'IL', '60618'),
('store_8', 'Store 8', '1550 N Kingsbury St', 'Chicago', 'IL', '60642'),
('store_9', 'Store 9', 'Block 37 - Aces, 108 N State St', 'Chicago', 'IL', '60602'),
('store_10', 'Store 10', '10 S Dearborn St', 'Chicago', 'IL', '60603');


CREATE TABLE IF NOT EXISTS Products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(5, 2) DEFAULT 0,
    product_sales INT,
    onsale VARCHAR(50) NOT NULL,
    rebate VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO Products (product_id, product_name, category, price, discount, product_sales, onsale, rebate) VALUES
('doorbells_1', 'Google Nest Doorbell', 'doorbells', 179.99, 20, NULL, 'yes', 'yes'),
('doorbells_2', 'Ecobee Smart Doorbell', 'doorbells', 159.99, 10, NULL, 'yes', 'yes'),
('doorbells_3', 'Eufy Smart Doorbell', 'doorbells', 99.99, 0, NULL, 'yes', 'no'),
('doorbells_4', 'Logitech Doorbell', 'doorbells', 199.99, 0, NULL, 'yes', 'no'),
('doorbells_5', 'Tp-Link Doorbell', 'doorbells', 99.99, 0, NULL, 'yes', 'no');

INSERT IGNORE INTO Products (product_id, product_name, category, price, discount, product_sales, onsale, rebate) VALUES
('doorlocks_1', 'Yale Doorlocks', 'doorlocks', 159.99, 0, NULL, 'yes', 'no'),
('doorlocks_2', 'Baldwin Doorlocks', 'doorlocks', 349.99, 20, NULL, 'yes', 'yes'),
('doorlocks_3', 'Solity Doorlocks', 'doorlocks', 159.99, 10, NULL, 'yes', 'yes'),
('doorlocks_4', 'Eufy Doorlocks', 'doorlocks', 149.99, 0, NULL, 'yes', 'no'),
('doorlocks_5', 'Teeho Doorlocks', 'doorlocks', 99.99, 0, NULL, 'yes', 'no');

INSERT IGNORE INTO Products (product_id, product_name, category, price, discount, product_sales, onsale, rebate) VALUES
('lights_1', 'Amazon Basics Led Light', 'lights', 11.99, 10, NULL, 'yes', 'yes'),
('lights_2', 'Fiet Led Light', 'lights', 8.49, 0, NULL, 'yes', 'no'),
('lights_3', 'Tp-Link Led Light Bulb', 'lights', 8.49, 0, NULL, 'yes', 'no'),
('lights_4', 'Goove Led Light', 'lights', 12.99, 20, NULL, 'yes', 'yes'),
('lights_5', 'Sengled Smart Bulb', 'lights', 7.99, 0, NULL, 'yes', 'no');

INSERT IGNORE INTO Products (product_id, product_name, category, price, discount, product_sales, onsale, rebate) VALUES
('speakers_1', 'Amazon Echo Dot 5th Gen', 'speakers', 49.99, 0, NULL, 'yes', 'no'),
('speakers_2', 'Google Home Smart Speaker', 'speakers', 116.99, 10, NULL, 'yes', 'yes'),
('speakers_3', 'Sony Smart Speaker', 'speakers', 39.99, 0, NULL, 'yes', 'no'),
('speakers_4', 'JBL Smart Speaker', 'speakers', 179.99, 0, NULL, 'yes', 'no'),
('speakers_5', 'Bose Portable Smart Speaker', 'speakers', 399.99, 20, NULL, 'yes', 'yes');

INSERT IGNORE INTO Products (product_id, product_name, category, price, discount, product_sales, onsale, rebate) VALUES
('thermostats_1', 'Google Nest Thermostats', 'thermostats', 179.99, 20, NULL, 'yes', 'yes'),
('thermostats_2', 'Ecobee Smart Thermostats', 'thermostats', 159.99, 0, NULL, 'yes', 'no'),
('thermostats_3', 'Sensi Smart Thermostats', 'thermostats', 179.99, 10, NULL, 'yes', 'yes'),
('thermostats_4', 'Honeywell Thermostats', 'thermostats', 144.99, 0, NULL, 'yes', 'no'),
('thermostats_5', 'Godrej CYNC Smart Thermostats', 'thermostats', 89.99, 0, NULL, 'yes', 'no');


CREATE TABLE IF NOT EXISTS ProductReviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_model_name VARCHAR(100) NOT NULL,
    product_category VARCHAR(50) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    store_id VARCHAR(100) NOT NULL,
    store_zip VARCHAR(10) NOT NULL,
    store_city VARCHAR(50) NOT NULL,
    store_state VARCHAR(50) NOT NULL,
    product_on_sale ENUM('Yes', 'No') NOT NULL,
    manufacturer_name VARCHAR(100) NOT NULL,
    manufacturer_rebate ENUM('Yes', 'No') NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_age INT NOT NULL,
    user_gender ENUM('Male', 'Female', 'Other') NOT NULL,
    user_occupation VARCHAR(100) NOT NULL,
    review_rating INT CHECK (review_rating >= 1 AND review_rating <= 5) NOT NULL,
    review_date DATE NOT NULL,
    review_text VARCHAR(250) NOT NULL
);



select * from storelocations;

select * from products;

select * from productreviews;

select * from orders;
