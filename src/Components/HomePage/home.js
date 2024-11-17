import React from "react";
import "../../styles.css";
import image from '../../Images/home.jpg';
import DoorBells from '../Products/DoorBells/doorbell'; // Adjust the import path if necessary
import DoorLocks from '../Products/Doorlocks/doorlocks'; // Adjust the import path if necessary
import Lights from '../Products/Lightings/lights'; // Adjust the import path if necessary
import Speakers from '../Products/Speakers/speakers'; // Adjust the import path if necessary
import Thermostats from '../Products/Thermostats/thermostats'; // Adjust the import path if necessary

function Home() {
  return (
    <div>
      <img
        className="header-image"
        src={image}
        alt="Buildings"
        style={{
          width: '93%',
          height: '66%'
        }}
      />
      <div className="product-sections">
        <h2>Featured Products</h2>
        <div className="products-container">
          <DoorBells />
          <DoorLocks />
          <Lights />
          <Speakers />
          <Thermostats />
        </div>
      </div>
    </div>
  );
}

export default Home;
