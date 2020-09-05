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
    fs.writeFileSync(filename, JSON.stringify(data))
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




module.exports = { isDuplicate, writeFile, validate }