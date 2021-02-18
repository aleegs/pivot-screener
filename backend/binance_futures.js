const Binance = require('node-binance-api');
const datamanager = require('./datamanager');
const fetch = require("node-fetch");
const binance = new Binance().options({
  APIKEY: '<key>',
  APISECRET: '<secret>'
});

// TODO: Update symbol list every X time

const MARKET = "crypto_binancefut"
let loop_interval = -1;

const timeframes = [ 
    { interval: '1d', objectName: 'daily', limit: 2 },
    { interval: '1w', objectName: 'weekly', limit: 2 },
    { interval: '1M', objectName: 'monthly', limit: 2 },
    //{ interval: '1h', objectName: 'hourly', limit: 500},
]

function binanceLimitToWeight(limit) {
    if (limit <= 100) return 1;
    if (limit <= 500) return 2;
    if (limit <= 100) return 5;
    else return 10;
}

function fetchTickersList() {
    return new Promise(async (resolve, reject) => {
        let res = await binance.futuresPrices();
        let list = [...Object.keys(res)];
        list.map(q => datamanager.addTicker({ticker: q, market: MARKET}));

        resolve();
    });
}

 function fetchTickersData() {
   return new Promise(async (resolve, reject) => {
        console.log("Running fetchTickersData()...");
        let promises = [];

        // For each ticker in tickerList initialize data object and push to data.tickersData
        for (let i = 0; i < datamanager.data.tickersList.length; i++) {
            const tickerObj = datamanager.data.tickersList[i];

            let candlesticksObj = { }

            // For every timeframe grab candlesticks for each ticker
            timeframes.forEach(async t => {
                const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${tickerObj.ticker}&interval=${t.interval}&limit=${t.limit}`;

                let prom = fetch(url).then(function(response) {
                    // TODO: CHECK FOR ERRORS
                        response.json().then(data => {

                            let formattedCandles = [];
                            
                            data.forEach(c => {
                                formattedCandles.push({ 
                                    open: parseFloat(c[1]), 
                                    high: parseFloat(c[2]), 
                                    low: parseFloat(c[3]), 
                                    close: parseFloat(c[4]), 
                                    time: (new Date(parseInt(c[6])))/1000})
                            })
                            
                            candlesticksObj[t.objectName+"Candles"] = formattedCandles;

                            datamanager.updateTickerCandlesticks(tickerObj, candlesticksObj);
                        });
                })
                .catch(function(error) {
                    console.error(url+" - Error fetching Binance API. Err = "+error.message);
                });

                promises.push(prom);
            })
        }

        await Promise.allSettled(promises);

        resolve();
    });
}

async function initialize() {
    return new Promise((resolve, reject) => {
        fetchTickersList().then(async () => {
            const total_tickers = datamanager.data.tickersList.length;
            const calculated_weight_per_ticker = timeframes.reduce((a, b) => a + (binanceLimitToWeight(b['limit']) || 0), 0);
            const calculated_weight_total = total_tickers * calculated_weight_per_ticker;
            const max_fetch_per_minute = 2400 / calculated_weight_total;
            const calculated_fetch_interval = 60 / max_fetch_per_minute;
            
            console.log(total_tickers);
            console.log(calculated_weight_per_ticker);
            console.log(calculated_weight_total);
            console.log(max_fetch_per_minute);
            console.log(calculated_fetch_interval)

            loop_interval = calculated_fetch_interval+3;

            console.log("Calculated fetch interval: "+calculated_fetch_interval+" (total weight per fetch: "+calculated_weight_total+")");

            resolve();
        });
    });
}

function loop() {
    if (datamanager.data.isReady) {
        
        fetchTickersData().then(() => {
            console.log("loop() done. Next interval in "+loop_interval+" seconds");
            setTimeout(() => {
                loop();
            }, 1000*loop_interval);
        })
    }
    else {
        initialize().then(() => loop());
    }
}

loop();