const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const server = require("http").createServer(app);

const fs = require("fs");
const { checkPrice, emitter } = require("./check");
const { isDuplicate, writeFile, validate } = require("./utils");

const port = process.env.PORT || 5000;

const DB = "database.json";
const db = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB)) : {};
const timer = 5000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));



//Get alerts by Email
app.get("/alerts/:email", (req, res) => {
  const { email } = req.params;

  //Get data from db
  const store = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB)) : {};

  if (store.users) {
    const data = store.users[email] || [];
    res.json(data);
  } else res.json([])
  
});



//Add Alerts to database
app.post("/add", (req, res) => {
  const data = req.body;

  //Validate data from client
  const { error } = validate(data);
  if (error) return res.json(error.details[0].message);

  //Add data to users db
  if (db.users) {
    const user = db.users[data.email];

    if (user) {
      //Check for duplicate
      const exist = isDuplicate(user, data);
      if (exist) return res.json("Alert already created");

      db.users[data.email] = [...user, data];
    } else {
      db.users[data.email] = [data];
    }
  } else {
    db.users = {};
    db.users[data.email] = [data];
  }


  //Add data to alert db
  if (db.alerts) {
    db.alerts.push(data);
  } else {
    db.alerts = [data];
  }


  //Add data to exchange db
  if (db.exchanges) {
    const el = db.exchanges.list;
    const de = data.exchange;

    //Convert list to set
    const newList = new Set(el);

    //Check if exchange is already on the list
    const onList = newList.has(de);
    if (onList) {
      db.exchanges[de] += 1;
    } else {
      newList.add(de);

      db.exchanges.list = [...newList];
      db.exchanges[de] = 1;
    }
  } else {
    db.exchanges = {};

    const newList = new Set();
    newList.add(data.exchange);

    db.exchanges.list = [...newList];
    db.exchanges[data.exchange] = 1;
  }

  //Save to database
  writeFile(DB, db);


  res.status(201).json('Alert Created');
});



//Checking alerts for match
setTimeout(start , timer)

emitter.on('start', () => {
    setTimeout(start , timer)
})



/**=========== FUNCTIONS ================ */

//Function to initiate checking
function start() {
    if (db.exchanges && db.alerts) {
        checkPrice(db.exchanges.list, db.alerts, removeAlert)
    } else setTimeout(start , timer)
}


//Function to delete alert
function removeAlert(alert) {
  const { email, exchange } = alert;

  //Remove from alerts db
  db.alerts = db.alerts.filter(itm => JSON.stringify(itm) !== JSON.stringify(alert));

  //Remove from uses db
  db.users[email] = db.users[email].filter(itm => JSON.stringify(itm) !== JSON.stringify(alert));

  //Keeping track of alerts in exchange db
  db.exchanges[exchange] -= 1;

  //Remove exchange from list
  if (db.exchanges[exchange] < 1) {
    const newList = new Set(db.exchanges.list);
    newList.delete(exchange);

    db.exchanges.list = [...newList];
    db.exchanges[exchange] = 0;
  }

  //Update database
  writeFile(DB, db);

}



server.listen(port, () => console.log("listening on port" + port));
