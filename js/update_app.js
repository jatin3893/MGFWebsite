// create the module and name it scotchApp
var updateApp = angular.module('UpdateApp', []);

updateApp.controller('ExchangeValueController', function($scope, $http) {
    $scope.reset = function() {
        $http.get("/data/currentRates.json")
        .then( function(response) {
            $scope.currencyTable = response.data;
        });
    }

    $scope.reset();

    $scope.submit = function() {
        postData = {}
        $scope.currencyTable.order.forEach(function(symbol) {
            postData[symbol] = {
                'buy': $scope.currencyTable[symbol].curBuy,
                'sell': $scope.currencyTable[symbol].curSell
            }
        }, this);

        $http({
            method : 'POST',
            url : '/api/update_rate',
            data : {
                'data': postData
            }
        }).then(function(response) {
            $scope.status = response.data;
        });
    }
});