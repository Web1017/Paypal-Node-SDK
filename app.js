const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AQTYXDViCEfPz20wYkrFLfUiQEPZmuq9OAPzbK1ri9oHfB4B4H3kV3mGiVXpcKclw2yD4Ixk7Jhtqr49',
    'client_secret': 'EFWZujTBsIaXZqXFwkEGAYbU2xhHJFlX7X0WBTj2HbbWsfcELUNvBFcmQ0VfeCj2ep-_UDk5Sv0WAST0'
  });

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res ) => res.render('index'));

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Film Tickets",
                    "sku": "001",
                    "price": "100.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "100.00"
            },
            "description": "The Film Festival Admission Tickets."
        }]
    };

   paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
       for(let i =0; i < payment.links.length; i++){
            if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href)
            }
       }
    }
    }); 
});

app.get('/success', (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentIdl

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "100.00"
            }
    }]
};

paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
  if (error) {
      console.log(error.response);
      throw error;
  } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
  }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));