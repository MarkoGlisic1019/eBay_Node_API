const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const http = require('http');
const axios = require('axios');

require('dotenv').config();

/* Initial */
let server; //eslint-disable-line
server = require('http').createServer(app); // eslint-disable-line

app.options('*', cors());
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  next();
});

app.use(require('body-parser').urlencoded({ limit: '50mb', extended: true }));
app.use(require('body-parser').json({ limit: '50mb' }));
app.use(require('cookie-parser')());

//Ebay
const EbayAuthToken = require('ebay-oauth-nodejs-client');
const ebayAuthToken = new EbayAuthToken({
    filePath: './test.json' // input file path.
})

let access_token = '';
let start_date = '2016-01-01';

//Get ApplicationToken
ebayAuthToken.getApplicationToken('PRODUCTION', 'https://api.ebay.com/oauth/api_scope')
    .then(res => {
        const jsonResp = JSON.parse(res);
        access_token = jsonResp.access_token;

        makeRequest();
    })
    .catch(error => {
        console.log('error: ', error);
    }
)

//Get GetOrder Jsons using axios
function makeRequest() {
    const config = {
        method: 'get',
        url: `https://api.ebay.com/sell/fulfillment/v1/order?filter=creationdate:%5B${start_date}T15:05:43.026Z..%5D`,
        headers: {'Authorization': 'Bearer ' + access_token}
    };
    axios(config).then((response) =>{
        let order_id;
        const jsonResp = JSON.parse(response);
        for (order_id = 0; order_id < jsonResp.total; order_id ++)
             console.log('OrderId:', jsonResp.orders[order_id].orderId);
    }).catch((error) => {
        console.log('error: ', error);
    })
}

