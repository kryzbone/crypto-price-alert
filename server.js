const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').createServer(app);

const fs = require('fs');
const validate = require('./validation')


const port = process.env.PORT || 5000

const alerts = fs.existsSync('alert.json')? JSON.parse(fs.readFileSync('alert.json')) : JSON.parse('[]');

app.use(express.static('public'))
app.use(bodyParser.urlencoded( { extended: true } ))
app.use(express.json({ limit: '1mb' }))



app.post('/add', (req, res) => {
    const data = req.body;

    //validate data from client
    const { error } = validate(data);
    if(error) return res.json(error.details[0].message)

    data.id = Date.now();

    // add data to database    
    alerts.push(data)

    fs.writeFile('alert.json', JSON.stringify(alerts), (err) => {
        if(err) console.log('failed')
    })
    
    res.json(data) 
     
} )




server.listen(port, ()=> console.log('listening on port' + port))