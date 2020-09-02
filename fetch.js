const fetch = require('node-fetch');

let pages = {};
const prices = {};

    

function getData(exchange, cb) {
    const url = `https://api.coingecko.com/api/v3/exchanges/${exchange}/tickers`;

    //fetch exchange market pairs
     fetchPairs(url, cb);
}


// Fetching pairs and price
function fetchPairs(url, cb) {

    fetch(url)
    .then((res) => {
        parseLink(res.headers.get('link'));
        return res.json();
    })
    .then((data) => {
        data.tickers.forEach(itm => {
            if(!itm.is_anomaly && !itm.is_stale) {
                const quote = itm.base + '/' + itm.target;
                
                getPrice(itm.last, quote)
            }   
        }) 

        //checking and fetching next page data
        if(pages.next) {
            fetchPairs(pages.next, cb) 
        }else cb(prices)

    })
    .catch(err => console.log(err.message))   

}        


//getting price
function getPrice(p,q) {
    const num = precise(p)
    prices[q] = num;
}


//convert exponential values to decimals
function precise(x) {
    return Number.parseFloat(x).toFixed(8);
}


//function to parse response header link
function parseLink(s) {
    const output = {};
    const regex = /<([^>]+)>; rel="([^"]+)"/g;
  
    let m;
    while (m = regex.exec(s)) {
      const [_, v, k] = m;
      output[k] = v;
    }
  
    pages = output;
}




module.exports = { getData }