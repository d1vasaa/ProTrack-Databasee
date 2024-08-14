const path = require("path");   // Import path library
const fs = require("fs");       // Import fs library

function redirectToHome() {
  window.location.href = '/index.html';
}

function redirectToAbout() {
  window.location.href = '/pages/about.html';
}

function redirectToPayment() {
  window.location.href = '/pages/payment.html';
}

function redirectToAccount() {
  window.location.href = '/pages/account.html';
}

function QRCodeUpdateData(result) {
  const RD = JSON.parse(result);

  if (!("SECURITY_KEY" in RD)) {
    console.error("Can't Update Data; scripts.js, line 24")
    return;
  }
  else if (RD.SECURITY_KEY != "a1B^2c!3D@4e(5F*6g7H&8i") {
    console.error("Can't Update Data; scripts.js, line 27");
    return;
  }
  
  fetch('/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(RD),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}
