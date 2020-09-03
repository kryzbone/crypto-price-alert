const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').createServer(app);

const fs = require('fs');
const  getData  = require('./fetch');
const { isDuplicate, writeFile, validate } = require('./utils');


const port = process.env.PORT || 5000

const ALERTS = 'alert.json';
const USERS = 'user.json';
const EXCHANGES = 'exchange.json'

const alerts = fs.existsSync(ALERTS)? JSON.parse(fs.readFileSync(ALERTS)) : JSON.parse('[]');
const users = fs.existsSync(USERS)? JSON.parse(fs.readFileSync(USERS)) : JSON.parse('{}');
const exchanges = fs.existsSync(EXCHANGES)? JSON.parse(fs.readFileSync(EXCHANGES)) : JSON.parse('{}');

app.use(express.static('public'))
app.use(bodyParser.urlencoded( { extended: true } ))
app.use(express.json({ limit: '1mb' }))



app.post('/add', (req, res) => {
    const data = req.body;

    //validate data from client
    const { error } = validate(data);
    if(error) return res.json(error.details[0].message);

    
    //add data to users db
    const user = users[data.email];
    if(user) {
        //check for duplicate
        const exist = isDuplicate(user, data);
        if(exist) return res.json('Alert already created');
        
        users[data.email] = [ ...user, data ];   
    }else {
        users[data.email] = [ data ];
    }
    
    // add data to alert db   
    alerts.push(data);


    //add data to exchange db
    const el = exchanges.list; 
    const de = data.exchange;

    if (el) {
        //check if exchange is already on the list
        const onList = el.has(de);
        if( onList ) {
            exchanges[de] += 1;
        }else {
            el.add(de)
            exchanges[de] = 1
        }

    }else {
        const list = new Set()
        list.add(de)
        exchanges.list = list

        exchanges[de] = 1;
    }
    

    if ( alerts.length ) {
        getData(data.exchange, (data) => {
            res.json(data)
        });
    }
    
})



//Test delete function
function removeAlert() {
    const del = alerts[0];
    const { email, exchange } = del;

   const newAlerts = alerts.filter(itm => itm !== del);

   users[email] = users[email].filter(itm => itm !== del);

   exchanges[exchange] -= 1;

    if( exchanges[exchange] < 1 ) {
        exchanges.list.remove(exchange);
    };
}




server.listen(port, ()=> console.log('listening on port' + port))