const express = require('express');
const controller = require('../controller/controller');
const path = require('path');

const router = express.Router();

const { utils } = require('ethers');
const sigUtil = require('eth-sig-util');

const jwtSecret = 'some very secret value';

router.get('/', (req, res) => {
    const filePath = path.resolve(__dirname, '../public/admin.html');
    res.sendFile(filePath);
});

router.get('/nonce', (req, res) => {
    const nonce = new Date().getTime();
    const address = req.query.address;

    const tempToken = jwt.sign({ nonce, address }, jwtSecret, { expiresIn: '60s' });
    const message = getSignMessage(address, nonce);

    res.json({ tempToken, message });
});

router.post('/verify', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const tempToken = authHeader && authHeader.split(" ")[1];

    if (!tempToken) return res.sendStatus(403);

    const userData = await jwt.verify(tempToken, jwtSecret);
    const nonce = userData.nonce;
    const address = userData.address;
    const message = getSignMessage(address, nonce);
    const signature = req.query.signature;

    const recoveredAddress = sigUtil.recoverPersonalSignature({ data: message, sig: signature });

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        const token = jwt.sign({ verifiedAddress: recoveredAddress }, jwtSecret, { expiresIn: '1d' });
        res.json({ token });
    } else {
        res.sendStatus(403);
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, jwtSecret, (err, authData) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.authData = authData;
        next();
    });
}

router.get('/secret', authenticateToken, (req, res) => {
    res.send(`Welcome address ${req.authData.verifiedAddress}`);
});

// Define a function to create a sign message
function getSignMessage(address, nonce) {
    return `Please sign this message for address ${address}:\n\n${nonce}`;
}

module.exports = router