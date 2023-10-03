// app.js

async function requestLoginAndAuthenticate() {
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        console.log('Logged in with MetaMask:', userAddress);

        const message = "Welcome to Marketplace\n\nClick on sign to authenticate and log into market";

        const signature = await ethereum.request({
            method: 'eth_sign',
            params: [userAddress, message],
        });

        console.log('Signature:', signature);

        // Make an HTTP POST request to your server for verification
        const response = await fetch('/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${signature}`, // Send the signature as a bearer token
            },
            body: JSON.stringify({ userAddress, signature }),
        });

        if (response.ok) {
            // Server successfully verified the signature
            const data = await response.json();
            alert(`Logged in with MetaMask and authenticated message!\nToken: ${data.token}`);
        } else {
            // Server verification failed
            console.error('Server verification error:', response.statusText);
        }
    } catch (error) {
        console.error('MetaMask login error:', error);
    }
}

// Check if MetaMask is installed
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
    // Add click event listener to the login button
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', requestLoginAndAuthenticate);
} else {
    console.log('MetaMask is not installed.');
}
