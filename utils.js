const joi = require('joi');
const fs = require('fs');


// function to check if alert has already been created
function isDuplicate(user, data) {
    const v = user.find(itm => JSON.stringify(itm) === JSON.stringify(data))

    const exist = v? true : false;

    return exist;
}


//function to write file
function writeFile(filename, data) {
    fs.writeFile(filename, JSON.stringify(data), (err) => {
        if(err) console.log('failed')
    })
}


// fuction to validate data
function validate(data) {
    const schema = joi.object({
        exchange: joi.string().required(),
        pair: joi.string().required(),
        sign: joi.string().required(),
        price: joi.number().required(),
        email: joi.string().email().required()
    })

    return schema.validate(data)
}


//Delete Alert function
function removeAlert() {
    const del = alerts[0];
    const { email, exchange } = del;

    //Remove from alerts db
    const newAlerts = alerts.filter(itm => itm !== del);

    //Remove from uses db
    users[email] = users[email].filter(itm => itm !== del);

    //Remove from exchanged db
    exchanges[exchange] -= 1;

    //Remove exchange from list
    if( exchanges[exchange] < 1 ) {
        exchanges.list.remove(exchange);
    };
}



module.exports = { isDuplicate, writeFile, validate, removeAlert }