const getData = require('./fetch');
const Emitter = require('events').EventEmitter;

const emitter = new Emitter()

function checkPrice( list, alerts ) {
    const p = {};

    emitter.on('done', () => {
        //compare alerts with prices for match and send an email if there is any
        Object.keys(p).length && alerts.forEach(itm => {
            const { exchange, pair, price, sign, email } = itm;

            switch (sign) {
                case 'g/t':
                    if(+p[exchange][pair] >= +price) {
                        console.log('alert')
                    }
                    break;

                case 'l/t':
                    if(+p[exchange][pair] <= +price) {
                        console.log('alert')
                    }
                    break;
            
                default:
                    break;
            }
            console.log(+p[exchange][pair], +price)
        })
    })
   

    //fetch crypto prices based on exchange list and group them by exchange names in "p"
    list && [...list].forEach((itm, i) => {
        getData(itm, (data) => {
            p[itm] = data
            if(list.size === i+1) emitter.emit('done')
        })
        console.log('working')
    })  
}



module.exports = checkPrice;