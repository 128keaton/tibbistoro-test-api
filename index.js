const express = require('express');
const app = express();
const http = require('http');

const port = 3000;

// TODO: Persistent storage (DB)
let units = {};

const boolNoYes = (boolean) => (!!boolean ? "yes" : "no");
const processTibboRequest = (req, res, callback) => {
    let requestString = '';

    req.on("data", (chunk) => {
        requestString += chunk.toString();
    });

    req.on("end", () => {
        const responseValue = callback(requestString);

        if (responseValue !== null && responseValue !== undefined) {
            res.send(responseValue);
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
    console.log(`Tibbistoro API listening at http://localhost:${port}`)
})
