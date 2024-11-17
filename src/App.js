import "./App.css";
import "./styles.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Components/default';
import Home from './Components/HomePage/home';
import DoorBells from './Components/Products/DoorBells/doorbell';
import DoorLocks from './Components/Products/Doorlocks/doorlocks';
import Lights from './Components/Products/Lightings/lights';
import Speakers from './Components/Products/Speakers/speakers';
import Thermostats from './Components/Products/Thermostats/thermostats';
import Login from './Components/Login/login';
import Create from './Components/Create-Account/create';
import Cart from './Components/Cart/cart';
import Checkout from './Components/Checkout/checkout';
import Review from './Components/Review/review';
import Trending from './Components/Trending/trending';
import Salesman from './Components/Salesman/salesman';
import Manager from './Components/Manager/Manager';
import Inventory from './Components/Manager/inventory';
import Sales from './Components/Manager/sales';
import CustomerService from './Components/Customer-Service/customerservice';



function App() {
  //const handleSuccessfulLogin = () => {
    // Handle the successful login logic here
   // console.log("User logged in successfully.");
 // };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="doorbells" element={<DoorBells />} />
          <Route path="doorlocks" element={<DoorLocks />} />
          <Route path="lights" element={<Lights />} />
          <Route path="speakers" element={<Speakers />} />
          <Route path="thermostats" element={<Thermostats />} />
          {/* Add more routes as needed */}
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/login" element={<Login />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/create" element={<Create />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/cart" element={<Cart />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/checkout" element={<Checkout />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/review" element={<Review />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/trending" element={<Trending />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/salesman" element={<Salesman />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/manager" element={<Manager />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} /> 
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="/customerservice" element={<CustomerService />} /> 
        </Route>

        
      </Routes>
    </Router>
  );
}

export default App;
