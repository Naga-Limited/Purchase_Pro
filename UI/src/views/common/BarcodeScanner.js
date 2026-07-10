import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Label, FormGroup, Input, InputGroup, Card, CardBody, CardHeader } from "reactstrap";

const BarcodeScanner = ({onScan,Label,QRControl}) => {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  let inputTimeout;

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!scanning) {
        setScanning(true);
        setBarcode('');
      }
      clearTimeout(inputTimeout);
      if (event.key === 'Enter') {
        handleScanComplete();
      } else {
        setBarcode((prev) => prev + event.key);
      }
    inputTimeout = setTimeout(() => {
      setScanning(false);
    }, 2000); // Adjust this timeout as needed
    };
    const handleScanComplete = () => {
      console.log('Scanned Barcode:', barcode);
      onScan(barcode.toUpperCase()); // Send the scanned barcode to the parent component
      // Handle the scanned barcode (e.g., navigate to a URL)
      // Example: window.location.href = `https://yourapp.com/item/${barcode}`;
      setBarcode(''); 
      setScanning(false);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [barcode, scanning,onScan]);

  return (
    <div>
      <h1></h1>
      {/* <Label>Vehicle No</Label>
      <Input type="text" disabled value={barcode} /> */}
      {/* <p>Scanned Barcode: {barcode}</p> */}
      <Label>{QRControl == false ? '' : (Label+' Number')}</Label>
      {/* <p> {barcode}</p> */}
    </div>
  );
};

export default BarcodeScanner;
