// CustomerService.js

import React, { useState, useEffect } from 'react';
import './service.css';

const CustomerService = () => {
  const [showModal, setShowModal] = useState(false);
  const [isOpenTicket, setIsOpenTicket] = useState(false);
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketImage, setTicketImage] = useState(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [finalDecision, setFinalDecision] = useState('');
  const [showFinalDecision, setShowFinalDecision] = useState(false); // New state variable

  // Handle submitting a new ticket
  const handleSubmitTicket = async () => {
    const formData = new FormData();
    formData.append("description", ticketDescription);
    formData.append("image", ticketImage);

    try {
      const response = await fetch("http://localhost:5000/submitTicket", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network response was not ok");
      }

      const data = await response.json();
      alert(`Ticket submitted! Your ticket number is: ${data.ticket_number}`);

      // Store ticket data in local storage
      localStorage.setItem("ticketData", JSON.stringify({ ticket_number: data.ticket_number, final_decision: data.final_decision }));
      setTicketNumber(data.ticket_number);
      setTicketStatus(data.final_decision);  // Update status with final decision

    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to submit ticket. ${error.message}`);
    }
  };

  // Handle checking the status of an existing ticket
  const handleCheckStatus = async () => {
    if (!ticketNumber) {
      alert("Please enter a ticket number to check status.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/checkTicketStatus?ticketNumber=${ticketNumber}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network response was not ok");
      }
      const data = await response.json();

      // Fetch final decision from local storage
      const storedTicketData = localStorage.getItem('ticketData');
      let finalDecision = '';

      if (storedTicketData) {
        const ticketData = JSON.parse(storedTicketData);
        finalDecision = ticketData.final_decision;  // Get final_decision from local storage
      }

      // Display final decision from backend
      setTicketStatus(data.status);
      setFinalDecision(finalDecision);
      setShowFinalDecision(true); // Show final decision after checking status

    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to check status. ${error.message}`);
    }
  };

  return (
    <>
      <nav>
        <ul>
          <li>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto',
                height: '71px',
                width: '662px',
                backgroundColor: 'transparent',
                borderRadius: '5px'
              }}>
              Customer Service
            </button>
          </li>
        </ul>
      </nav>

      {showModal && (
        <div className="modal">
          <h2 style={{ alignItems: 'center', marginLeft: '230px', backgroundColor: '#f9f9f9' }}>Customer Service</h2>
          <button onClick={() => { setIsOpenTicket(true); setTicketStatus(''); setShowFinalDecision(false); }} style={{ backgroundColor: '#DB2C39', color: 'whitesmoke', width: '130px', height: '30px', border: 'transparent', marginLeft: '180px', marginBottom: '20px', marginTop: '15px', borderRadius: '15px' }}>Open a Ticket</button>
          <button onClick={() => { setIsOpenTicket(false); setTicketStatus(''); setShowFinalDecision(false); }} style={{ backgroundColor: '#DB2C39', color: 'whitesmoke', width: '130px', height: '30px', border: 'transparent', marginLeft: '50px', marginBottom: '20px', marginTop: '15px', borderRadius: '15px' }}>Check Ticket Status</button>

          {isOpenTicket ? (
            <div>
              <h3>Open a Ticket</h3>
              <textarea
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Describe the issue"
              />
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={(e) => setTicketImage(e.target.files[0])}
                style={{ backgroundColor: '#000000', color: 'whitesmoke', width: '215px', height: '27px', border: 'transparent', borderRadius: '15px', marginLeft: '20px' }}
              />
              <button onClick={handleSubmitTicket}
                style={{ backgroundColor: '#0b0081', color: 'whitesmoke', width: '130px', height: '30px', border: 'transparent', marginLeft: '135px', marginBottom: '20px', marginTop: '15px', borderRadius: '15px' }}>Submit Ticket</button>
            </div>
          ) : (
            <div>
              <h3>Check Ticket Status</h3>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="Enter Ticket Number"
              />
              <button onClick={handleCheckStatus}
                style={{ backgroundColor: '#0b0081', color: 'whitesmoke', width: '130px', height: '30px', border: 'transparent', marginLeft: '135px', marginBottom: '20px', marginTop: '15px', borderRadius: '15px' }}>Check Status</button>
              {/*ticketStatus && <p>Ticket Status: {ticketStatus}</p>*/}
              {showFinalDecision && finalDecision && <p>Final Decision: {finalDecision}</p>} {/* Display final decision based on showFinalDecision */}
            </div>
          )}
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
    </>
  );
};

export default CustomerService;
