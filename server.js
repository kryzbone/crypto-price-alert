const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').createServer(app);

const port = process.env.PORT || 5000

const alerts = new Set()

app.use(express.static('public'))
app.use(bodyParser.urlencoded( { extended: true } ))
app.use(express.json({ limit: '1mb' }))

app.post('/add', (req, res) => {
    const data = JSON.stringify(req.body);
    if(alerts.has(data)) {
        res.end(JSON.stringify({msg : 'already created'}))
    } else {
        alerts.add(data)
        console.log(alerts);
        res.end(data) 
    }
   
} )




server.listen(port, ()=> console.log('listening on port' + port))