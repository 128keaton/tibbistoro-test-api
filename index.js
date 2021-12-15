const express = require('express');
const app = express();
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const port = 3000;

let key, value;

fs.readFile('key.txt', 'utf8' , (err, data) => {
    if (err) {
        console.error(err);
        console.error('Could not read key.txt!');
        process.exit(-1);
    }

    key = data;
});

fs.readFile('value.txt', 'utf8' , (err, data) => {
    if (err) {
        console.error(err);
        console.error('Could not read value.txt!');
        process.exit(-1);
    }

    value = data;
})


// Warning, storage is not persistent
let units = {};

const boolNoYes = (boolean) => (!!boolean ? "yes" : "no");

const requestPermitted = (req) => {
    if (req.headers['authentication']) {
        const decipher = crypto.createDecipheriv("rc4", key, '');
        const rawValue = unescape((req.headers['authentication'] + '').replace(/\+/g, '%20'));

        let decrypted = decipher.update(rawValue, "binary", "utf8");
        decrypted += decipher.final("utf8");

        return (decrypted === value);
    }

    return false;
}

const processTibboRequest = (req, res, callback) => {
    let requestString = '';

    req.on("data", (chunk) => {
        requestString += chunk.toString();
    });

    req.on("end", () => {
        if (requestPermitted(req)) {

            const responseValue = callback(requestString);

            if (responseValue !== null && responseValue !== undefined) {
                res.send(responseValue);
            }
        } else {
            console.error('REQUEST DENIED');
        }
    });
};

app.post('/auth', (req, res) => processTibboRequest(req, res, (requestString) => {
    const [cardCode, facilityCode, unit] = requestString.split('-');

    console.log("AUTH:", cardCode, facilityCode, unit);
    return boolNoYes(cardCode === '60679' && facilityCode === '2052');
}));


app.post('/ident', (req, res) => processTibboRequest(req, res, (requestString) => {
    const [ipAddress, unit] = requestString.split('-');

    console.log("IDENT:", ipAddress, unit);
    units[unit] = ipAddress;
    console.log("UNITS:", units);
}));

app.post('/door/:unit', (req, res) => {
    const unit = req.params.unit;


    if (!!unit && !!units[unit]) {
        const ipAddress = units[unit];

        const doorReq = http.request(`http://${ipAddress}/door.html`, doorRes => {
            console.log(`Door Relay Response Code: ${doorRes.statusCode}`);
            res.send(boolNoYes(doorRes.statusCode === 200));
        });

        doorReq.on('error', error => {
            console.error("ERR:", error);
            res.send(boolNoYes(false));
        });

        doorReq.end();
    } else {
        res.send(boolNoYes(false));
    }
});

app.listen(port, () => {
    console.log(`Tibbistoro Test API listening at http://localhost:${port}`)
})
