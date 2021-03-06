# Tornado
from tornado import ioloop
from tornado import web
from tornado import wsgi

# std libs
import json
import datetime

class SimpleRequestHandler(web.RequestHandler):
    def get(self):
        self.write('Testing Web APp')

    def post(self, update):
        if update == 'update_rate':
            changes = json.loads(self.request.body)['data']
            original = None
            currentTime = datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')

            with open('public/data/currentRates.json', 'r') as fp:
                original = json.load(fp)

            for currency in original:
                symbol = str(currency["symbol"])
                if currency["buy"] == changes[symbol]["buy"] and currency["sell"] == changes[symbol]["sell"]:
                    continue

                print currentTime
                currency["buyHistory"].insert(0, {
                    "date": currentTime,
                    "value": currency["buy"],
                })
                if len(currency["buyHistory"]) > 60:
                    currency["buyHistory"].pop()
                currency["buy"] = changes[symbol]["buy"]

                currency["sellHistory"].insert(0, {
                    "date": currentTime,
                    "value": currency["sell"],
                })
                if len(currency["sellHistory"]) > 60:
                    currency["sellHistory"].pop()
                currency["sell"] = changes[symbol]["sell"]

                print currency["buyHistory"]

            with open('public/data/currentRates.json', 'w') as fp:
                json.dump(original, fp, indent = 4)

            self.write('Success');


# Initialize the app
app = web.Application([
        (r"/api/(.*)", SimpleRequestHandler),
        (r"/(.*)", web.StaticFileHandler, {
            "path": r".",
            "default_filename": "index.html"
        })
    ], debug = True)

application = wsgi.WSGIAdapter(app)

if __name__ == '__main__':
    print 'Start http://localhost:5000'
    app.listen(5000)
    ioloop.IOLoop.current().start()
