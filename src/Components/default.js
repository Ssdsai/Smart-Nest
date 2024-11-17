import React, { useState, useEffect } from "react";
import "../styles.css";
import Footer from './footer';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

function Default() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  const [suggestions, setSuggestions] = useState([]); // State for suggestions
  const navigate = useNavigate();
  const location = useLocation();
  //const userEmail = localStorage.getItem('userEmail');

                                                                            // Check login state on component mount
  useEffect(() => {
    const loggedInState = localStorage.getItem("isLoggedIn");
    if (loggedInState === null) {
      localStorage.setItem("isLoggedIn", "false"); // Default to false
    }
    setIsLoggedIn(loggedInState === "true");

    // Check for state when navigating back from login
    const locationState = location.state?.loggedIn;
    if (locationState) {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
    }
  }, [location]);

  const handleLoginLogout = () => {
    if (isLoggedIn) {
                                                                          // Log out the user
      localStorage.setItem("isLoggedIn", "false");
      setIsLoggedIn(false);
      navigate("/"); // Redirect to home page after logout
    } else {
      // Redirect to login page
      navigate("/login");
    }
  };

                                                                // Callback to update login state after login
  const handleSuccessfulLogin = () => {
    setIsLoggedIn(true); // Update the state to reflect the login status
  };

  // Fetch suggestions when the search term changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      // Make AJAX call to the servlet to get suggestions
      fetch(`http://localhost:8080/backend/autocomplete?query=${value}`)
        .then(response => response.json())
        .then(data => setSuggestions(data)) // Update suggestions state with the fetched data
        .catch(error => console.error('Error fetching suggestions:', error));
    } else {
      setSuggestions([]); // Clear suggestions if search term is too short
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]); // Clear suggestions after selecting
  };

  return (
    <div id="container">
      <header>
        <h1>
          <a href="/">
            Smart-Nest<span> &nbsp;Solutions</span>
          </a>
        </h1>
        <h2>For your Smart Home</h2>

        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for products..."
            className="search-input"
            style={{ marginBottom: '-80px', width:'350px' }}
            />
          {/* Dropdown for search suggestions */}
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cart-section">
          <div className="cart-icon">
            <a href="/cart">
              <FontAwesomeIcon icon={faShoppingCart} style={{ marginLeft: '700px' }} />
              <h4 style={{ marginLeft: '700px' }}>Your Cart</h4>
            </a>
          </div>
          
          {/* Conditionally render the Order Status button */}
          {isLoggedIn && (
            <button
              className="OrderStatusButton"
              onClick={() => navigate('/OrderStatus')}
              style={{ width: '15%', height: '50%', marginLeft: '700px' }}
            >
              Order Status
            </button>
          )}
        </div>
        
      </header>

      <nav>
        <ul>
          <li className="start selected">
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/doorbells">Doorbells</a>
          </li>
          <li>
            <a href="/doorlocks">Door Locks</a>
          </li>
          <li>
            <a href="/speakers">Speakers</a>
          </li>
          <li className="end">
            <a href="/lights">Lightnings</a>
          </li>
          <li>
            <a href="/thermostats">Thermostats</a>
          </li>

          <button
            className="Login"
            onClick={handleLoginLogout}
            style={{ width: '10%', height: '66%', marginLeft: '130px', marginTop: '12px', display: 'inline-block' }}
          >
            {isLoggedIn ? <div>Logout</div> : <div>Login/SignUp</div>}
          </button>

          {/* <a href
            className="Login"
            onClick={handleLoginLogout}
            style={{ width: '10%', height: '66%', marginLeft: '100px', marginTop: '-15px', display: 'inline-block' }}
          >
            {isLoggedIn ? <div>Logout</div> : <div>Login/SignUp</div>}
          </a> */}

        </ul>
      </nav>

      <div id="body">
        <section id="content">
          <article>
            <Outlet context={{ handleSuccessfulLogin }} />
          </article>
        </section>

        <aside className="sidebar">
          <ul>
              {/*userEmail === "salesman@smartnest.com" && (
                <li>
                    <a href="/salesman">Sales Man Dashboard</a>
                </li>
              )*/}
          <li>
              <h4>Find the #1 Trending products</h4>
                <ul>
                  <li>
                    <a href="/trending">#1 Trending</a>
                  </li>
                </ul>
            </li>
            <li>
              <h4>Review / Recommend</h4>
                <ul>
                  <li>
                    <a href="/review">Write a Product Review</a>
                  </li>
                  <li>
                    <a href="/viewreview">View Reviews</a>
                  </li>
                  <li>
                    <a href="/recommend">Find new Products</a>
                  </li>
                </ul>
            </li>

            <li>
              <h4>Need Help?</h4>
                <ul>
                  <li>
                    <a href="/customerservice">Customer Service</a>
                  </li>
                </ul>
            </li>

            <li>
              <h4>Smart Doorbells</h4>
              <ul>
                <li>
                  <a href="/doorbells#google-doorbell">Google Nest Doorbell</a>
                </li>
                <li>
                  <a href="/doorbells#echobee-doorbell">Ecobee Smart Doorbell</a>
                </li>
                <li>
                  <a href="/doorbells#eufy-doorbell">Eufy Smart Doorbell</a>
                </li>
                <li>
                  <a href="/doorbells#logitech-doorbell">Logitech Doorbell</a>
                </li>
                <li>
                  <a href="/doorbells#tplink-doorbell">Tp-Link Doorbell</a>
                </li>
              </ul>
            </li>
            <li>
              <h4>Smart Door Locks</h4>
              <ul>
                <li>
                  <a href="/doorlocks#yale-doorlock">Yale Door Lock</a>
                </li>
                <li>
                  <a href="/doorlocks#baldwin-doorlock">Baldwin Door Lock</a>
                </li>
                <li>
                  <a href="/doorlocks#solity-doorlock">Solity Door Lock</a>
                </li>
                <li>
                  <a href="/doorlocks#eufy-doorlock">Eufy Door Lock</a>
                </li>
                <li>
                  <a href="/doorlocks#teeho-doorlock">Teeho Door Lock</a>
                </li>
              </ul>
            </li>

            <li>
              <h4>Smart Speakers</h4>
              <ul>
                <li>
                  <a href="/speakers#amazon-speaker">Amazon Echo Dot</a>
                </li>
                <li>
                  <a href="/speakers#google-speaker">Google Home Smart Speakers</a>
                </li>
                <li>
                  <a href="/speakers#sony-speaker">Sony Smart Speakers</a>
                </li>
                <li>
                  <a href="/speakers#jbl-speaker">JBL Smart Speakers</a>
                </li>
                <li>
                  <a href="/speakers#bose-speaker">Bose Smart Speakers</a>
                </li>
              </ul>
            </li>

            <li>
              <h4>Smart Lightings</h4>
              <ul>
                <li>
                  <a href="/lights#amazon-light">Amazon Basics LED Lights</a>
                </li>
                <li>
                  <a href="/lights#fiet-light">Fiet LED Light </a>
                </li>
                <li>
                  <a href="/lights#tplink-light">Tp-Link Led Light Bulb</a>
                </li>
                <li>
                  <a href="/lights#goove-light">Goove LED Light</a>
                </li>
                <li>
                  <a href="/lights#sengled-light">Sengled Smart Bulb</a>
                </li>
              </ul>
            </li>

            <li>
              <h4>Smart Thermostats</h4>
              <ul>
                <li>
                  <a href="/thermostats#google-thermostat">Google Nest Thermostat</a>
                </li>
                <li>
                  <a href="/thermostats#echobee-thermostat">Ecobee Smart Thermostat</a>
                </li>
                <li>
                  <a href="/thermostats#sensi-thermostat">Sensi Smart Thermostats</a>
                </li>
                <li>
                  <a href="/thermostats#honeywell-thermostat">Honeywell Thermostats</a>
                </li>
                <li>
                  <a href="/thermostats#godrej-thermostat">Godrej Smart Thermostat</a>
                </li>
              </ul>
            </li>
          </ul>
        </aside>

        <div className="clear"></div>
      </div>
      <Footer />
    </div>
  );
}

export default Default;
