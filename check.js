require('dotenv').config()
const getData = require('./fetch');


const Emitter = require('events').EventEmitter;
const emitter = new Emitter()

const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;


const { CLIENT_ID, CLIENT_SECRET, ACCESS_TOKRN, REFRESH_TOKEN, EMAIL } = process.env;
const redirectURL = "https://developers.google.com/oauthplayground";


const myOAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, redirectURL);
myOAuth2Client.setCredentials({
    REFRESH_TOKEN
})

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       type: 'OAuth2',
       user: EMAIL,
       clientId: CLIENT_ID,
       clientSecret: CLIENT_SECRET,
       refreshToken: REFRESH_TOKEN,
       accesToken: ACCESS_TOKRN
    }
})


//Crypto prices
const p = {};


//Event listener for when getPrice is done 
emitter.on('done', (alerts, removeAlert) => {
    
    //compare alerts with prices for match and send an email if there is any
    Object.keys(p).length && alerts.forEach(itm => {
        const { exchange, pair, price, sign, email } = itm;

        switch (sign) {
            case 'g/t':
                if(+p[exchange][pair] >= +price) {

                    const mailOptions = {
                        from: `CRYPTO ALERT  <${EMAIL}>`,
                        to: email,
                        subject: `${pair.split('/')[0]} PRICE TARGET MET`,
                        text: `${pair.split('/')[0]}'s Price is Greater than ${price} ${pair.split('/')[1]} on ${exchange}.`
                    }

                    transporter.sendMail(mailOptions, (err, result) => {
                        if(err) return 
                        if(result) return 
                    })

                    removeAlert(itm)
                }
                break;

            case 'l/t':
                if(+p[exchange][pair] <= +price) {

                    const mailOptions = {
                        from: `CRYPTO ALERT  <${EMAIL}>`,
                        to: email,
                        subject: `${pair.split('/')[0]} PRICE TARGET MET`,
                        text: `${pair.split('/')[0]}'s Price is Lower than ${price} ${pair.split('/')[1]} on ${exchange}.`
                    }

                    transporter.sendMail(mailOptions, (err, result) => {
                        if(err) return 
                        if(result) return 
                    })

                    removeAlert(itm)
                }
                break;
        
            default:
                break;
        }

    })
})



function checkPrice( list, alerts, removeAlert ) {
    //Fetch crypto prices based on exchange list and group them by exchange names in "p"
    if (list && list.length) {
        list.forEach((itm, i) => {
            getData(itm, (data) => {
                p[itm] = data   

                if(list.length === i+1) {
                    emitter.emit('done', alerts, removeAlert)
                    emitter.emit('start')
                }  
            })
        }) 
    } else emitter.emit('start');

}


module.exports = {checkPrice, emitter };