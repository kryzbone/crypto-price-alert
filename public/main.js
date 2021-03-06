//SELECTORS
const exchange = window["exchange"],
  symbol = window["pair"],
  list = window["pair-list"],
  sign = window["sign"],
  price = window["price"],
  email = window["email"],
  form = window["form"],
  loading = window["loading"],
  alertForm = window["alert-form"],
  alertEmail = window["alert-email"];

let pages,
  prices = {},
  count = 1;

//EVENTS
window.onload = () => {
  getPairs();
};

exchange.addEventListener("change", () => {
  price.value = "";
  symbol.value = "";
  loading.className = "";
  getPairs();
});

symbol.addEventListener("change", () => {
  let v = symbol.value;
  v ? (price.value = prices[v]) : (price.value = "");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    exchange: exchange.value,
    pair: pair.value,
    sign: sign.value,
    price: price.value,
    email: email.value,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  fetch("/add", options)
    .then((res) => res.json())
    .then((data) => {
      const box = window['msg-box'];
      box.innerText = data;
      box.className = "show";
      setTimeout(() => {
        box.className = ''
      }, 3500)
    })
    .catch((err) => console.log(err.message));
});

alertForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = alertEmail.value;

  fetch(`/alerts/${email}`)
    .then((res) => res.json())
    .then((data) => {
      const alertBox = window["alerts"];

      if ( data.length === 0 ) {
        alertBox.innerHTML = `<p id="no-alert" >You Have no Alerts</p>`;
      } else {
        alertBox.innerHTML = "";

        data.forEach((itm) => {
          const alert = `
          <div id="alert" >
            <h4>${itm.exchange}</h4>
            <p>
                pair:  <span>${itm.pair}</span>
                Target:  <span>${itm.sign === "g/t" ? "Above" : "Below"}</span> 
                <span>${itm.price} ${itm.pair.split("/")[1]}</span>
            </p>
          </div>
          `

          alertBox.innerHTML += alert;
        });
      }
      window['clear'].className = "";
    })
    .catch((err) => {
      console.log(err);
    });

    alertEmail.value = ""
});

//Hide clear Button
window['clear'].addEventListener('click', (e) => {
  window['alerts'].innerHTML = "";
  e.target.className = "hide"
} )


//FUNCTIONS
function getPairs() {
  const url = `https://api.coingecko.com/api/v3/exchanges/${exchange.value}/tickers`;
  //clear datalist
  list.innerHTML = "";
  pages = {};
  prices = {};

  //fetch exchange market pairs
  fetchPairs(url);
}

//getting price
function getPrice(p, q) {
  const num = precise(p);
  prices[q] = num;
}

//function to parse response header link
function parseLink(s) {
  const output = {};
  const regex = /<([^>]+)>; rel="([^"]+)"/g;

  let m;
  while ((m = regex.exec(s))) {
    const [_, v, k] = m;
    output[k] = v;
  }

  pages = output;
}

// Fetching pairs and price
function fetchPairs(url) {
  fetch(url)
    .then((res) => {
      parseLink(res.headers.get("link"));
      return res.json();
    })
    .then((data) => {
      data.tickers.forEach((itm) => {
        if (!itm.is_anomaly && !itm.is_stale) {
          const quote = itm.base + "/" + itm.target;
          const option = document.createElement("option");
          option.value = quote;
          list.appendChild(option);

          getPrice(itm.last, quote);
        }
      });

      //checking and fetching next page data
      if (pages.next) {
        fetchPairs(pages.next);
      } else setTimeout(() => (loading.className = "hide"), 1000);
    })
    .catch((err) => {
      loading.className = "hide" 
      console.log(err.message)
    });
}

//convert exponential values to decimals
function precise(x) {
  return Number.parseFloat(x).toFixed(8);
}
