import React, { useState } from 'react';
import {QrReader} from 'react-qr-reader';

const QRCodeScanner = () => {
  const [result, setResult] = useState('No result');

  const handleScan = (data) => {
    if (data) {
      setResult(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <h1>QR Code Scanner</h1>
      <QrReader
        onScan={handleScan}
        onError={handleError}
        style={{ width: '100%' }}
      />
      <p>Result: {result}</p>
    </div>
  );
};

export default QRCodeScanner;