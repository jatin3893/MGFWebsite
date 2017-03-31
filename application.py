# Tornado
from tornado import ioloop
from tornado import web
from tornado import wsgi

# std imports
import json
import datetime

CurrentRateFile = 'data/CurrentRates.json'

kCurrencyList = {
    "USD": "U.S. Dollar", 
    "MUR": "Mauritius Rupee", 
    "IDR": "Indonesian Rupiah", 
    "AED": "U.A.E. Dirham", 
    "GBP": "Great Britain Pound", 
    "LKR": "Sri Lankan Rupee", 
    "CAD": "Canadian Dollar", 
    "MYR": "Malaysian Ringgit", 
    "QAR": "Qatar Rial", 
    "SAR": "Saudi Riyal", 
    "SEK": "Swedish Krona", 
    "SGD": "Singapore Dollar", 
    "HKD": "Hong Kong Dollar", 
    "AUD": "Australian Dollar", 
    "CHF": "Swiss Franc", 
    "CNY": "Chinese Yuan", 
    "THB": "Thailand Bhat", 
    "EUR": "Euro", 
    "MOP": "Macau Pataca", 
    "INR": "Indian Rupee", 
    "JPY": "Japan Yen", 
    "OMR": "Oman Riyal", 
    "PHP": "Philippine Peso", 
    "ZAR": "South Africa Rand"
}

kMaxHistory = 60

kName = 'Name'
kSymbol = 'Symbol'
kBuy = 'Buy'
kSell = 'Sell'
kShow = 'Show'
kData = 'Data'
kCurSell = 'CurSell'
kCurBuy = 'CurBuy'
kLastUpdated = 'Updated'

kCurrencyTemplate = {
    kName: 'UNKNOWN',
    kSymbol: 'UNK',
    kBuy: [1],
    kSell: [1],
    kShow: False
}

class SimpleRequestHandler(web.RequestHandler):
    def post(self, update):
        if update == 'update_rate':
            currentTime = datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')
            changes = json.loads(self.request.body)['data']
            print changes

            currencyDict = None
            with open(CurrentRateFile, 'r') as fp:
                currencyDict = json.load(fp)
            
            for currency in currencyDict[kData]:
                if currency[kSymbol] not in changes:
                    print currency[kSymbol]
                    continue

                symbol = currency[kSymbol]
                print currency
                print changes[symbol]
                if currency.get(kCurBuy, None) != changes[symbol][kBuy]:
                    currency[kBuy].append({
                        'x': currentTime,
                        'y': changes[symbol][kBuy]
                    })
                    currency[kCurBuy] = changes[symbol][kBuy]

                if currency.get(kCurSell, None) != changes[symbol][kBuy]:
                    currency[kSell].append({
                        'x': currentTime,
                        'y': changes[symbol][kSell]
                    })
                    currency[kCurSell] = changes[symbol][kBuy]
                
                currency[kBuy] = currency[kBuy][-kMaxHistory:]
                currency[kSell] = currency[kSell][-kMaxHistory:]

            with open(CurrentRateFile, 'w') as fp:
                currencyDict[kLastUpdated] = currentTime
                json.dump(currencyDict, fp, indent=4)
                self.write('New Rates Added')


# Initialize the app
app = web.Application([
        (r"/api/(.*)", SimpleRequestHandler),
        (r"/(.*)", web.StaticFileHandler, {
            "path": r".",
            "default_filename": "index.html"
        })
    ], debug = True)

application = wsgi.WSGIAdapter(app)

def init():
    # Init current rates
    try:
        with open(CurrentRateFile, 'r') as fp:
            currencyDict = json.load(fp)
    except ValueError:
        currencyDict = {}

    currencyDict.setdefault(kData, [])
    
    currentCurrencyList = [currency[kSymbol] for currency in currencyDict[kData]]
    for symbol in kCurrencyList:
        if symbol not in currentCurrencyList:
            currencyDict[kData].append({
                kSymbol: symbol,
                kName: kCurrencyList[symbol],
                kShow: False,
                kSell: [1],
                kBuy: [1],
                kCurBuy: 1,
                kCurSell: 1
            })
    
    with open(CurrentRateFile, 'w') as fp:
        json.dump(currencyDict, fp, indent=4)


if __name__ == '__main__':
    print 'Start http://localhost:5000'
    init()
    app.listen(5000)
    ioloop.IOLoop.current().start()
