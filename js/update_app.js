// create the module and name it scotchApp
var updateApp = angular.module('UpdateApp', []);

updateApp.controller('ExchangeValueController', function($scope, $http) {
    $scope.reset = function() {
        $http.get("/data/currentRates.json")
        .then( function(response) {
            $scope.currencyTable = response.data['Data'];
        });
    }

    $scope.reset();

    $scope.submit = function() {
        postData = {}
        $scope.currencyTable.forEach(function(currency) {
            postData[currency.Symbol] = {
                'Buy': currency.CurBuy,
                'Sell': currency.CurSell
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