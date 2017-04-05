# Tornado
from tornado import ioloop
from tornado import web
from tornado import wsgi

# std imports
import json
import datetime

CurrentRateFile = 'data/CurrentRates.json'

kCurrencyList = [
    ("USD", "U.S. Dollar"),
    ("EUR", "Euro"),
    ("THB", "Thailand Bhat"),
    ("AED", "U.A.E. Dirham"),
    ("CAD", "Canadian Dollar"),
    ("GBP", "Great Britain Pound"),
    ("MUR", "Mauritius Rupee"),
    ("IDR", "Indonesian Rupiah"),
    ("LKR", "Sri Lankan Rupee"),
    ("MYR", "Malaysian Ringgit"),
    ("QAR", "Qatar Rial"),
    ("SAR", "Saudi Riyal"),
    ("SEK", "Swedish Krona"),
    ("SGD", "Singapore Dollar"),
    ("HKD", "Hong Kong Dollar"),
    ("AUD", "Australian Dollar"),
    ("CHF", "Swiss Franc"),
    ("CNY", "Chinese Yuan"),
    ("MOP", "Macau Pataca"),
    ("JPY", "Japan Yen"),
    ("OMR", "Oman Riyal"),
    ("PHP", "Philippine Peso"),
    ("ZAR", "South Africa Rand"),
    ("INR", "Indian Rupee")
]

kDefaultShow = [
    'USD',
    'EUR'
]

kMaxHistory = 60

kName = 'name'
kSymbol = 'symbol'
kBuy = 'buy'
kSell = 'sell'
kData = 'data'
kCurSell = 'curSell'
kCurBuy = 'curBuy'
kTime = 'time'
kOrder = 'order'
kShow = 'show'

kCurrencyTemplate = {
    kName: 'UNKNOWN',
    kSymbol: 'UNK',
    kBuy: [1],
    kSell: [1],
}

class SimpleRequestHandler(web.RequestHandler):
    def post(self, update):
        if update == 'update_rate':
            currentTime = datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')
            changeDict = json.loads(self.request.body)['data']

            currencyDict = None
            with open(CurrentRateFile, 'r') as fp:
                currencyDict = json.load(fp)

            for symbol in changeDict:
                change = changeDict[symbol]
                currency = currencyDict[symbol]
            
                if currency[kCurBuy] and currency[kCurBuy] != change.get(kBuy, None):
                    currency[kBuy].append({
                        'x': currentTime,
                        'y': change[kBuy]
                    })
                    currency[kCurBuy] = change[kBuy]

                if currency[kCurSell] and currency[kCurSell] != change.get(kSell, None):
                    currency[kSell].append({
                        'x': currentTime,
                        'y': change[kSell]
                    })
                    currency[kCurSell] = change[kSell]
                
                # Adjust history length
                currency[kBuy] = currency[kBuy][-kMaxHistory:]
                currency[kSell] = currency[kSell][-kMaxHistory:]

            with open(CurrentRateFile, 'w') as fp:
                currencyDict[kTime] = currentTime
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

    defaultCurrencyValue = 1
    currentTime = datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    for symbol, name in kCurrencyList:
        currencyDict.setdefault(symbol, {
            kSymbol: symbol,
            kName: name,
            kSell: [ {
                'x': currentTime,
                'y': defaultCurrencyValue
            }],
            kBuy: [{
                'x': currentTime,
                'y': defaultCurrencyValue
            }],
            kCurBuy: defaultCurrencyValue,
            kCurSell: defaultCurrencyValue
        })

    currencyDict[kOrder] = [symbol for symbol, name in kCurrencyList]
    currencyDict[kTime] = currentTime
    currencyDict[kShow] = kDefaultShow
 
    with open(CurrentRateFile, 'w') as fp:
        json.dump(currencyDict, fp, indent=4)


if __name__ == '__main__':
    print 'Start http://localhost:5000'
    init()
    app.listen(5000)
    ioloop.IOLoop.current().start()
