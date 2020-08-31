const joi = require('joi');


module.exports = function validate(data) {
    const schema = joi.object({
        exchange: joi.string().required(),
        pair: joi.string().required(),
        sign: joi.string().required(),
        price: joi.number().required(),
        email: joi.string().email().required()
    })

    return schema.validate(data)
}

