// create the module and name it scotchApp
var mgfApp = angular.module('mgfApp', ['ngRoute', "chart.js"]);

// configure our routes
mgfApp.config(function($routeProvider) {
    $routeProvider
        // route for the services page
        .when('/Services', {
            templateUrl : '/templates/services.html',
            controller  : 'servicesController'
        })
        // route for the about page
        .when('/About', {
            templateUrl : '/templates/about.html',
            controller  : 'aboutController'
        })
        // route for the contact page
        .when('/Contact', {
            templateUrl : '/templates/contact.html',
            controller  : 'contactController'
        })
        // route for the exchange rates page
        .when('/ExchangeRates', {
            templateUrl : '/templates/exchange_rates.html',
            controller  : 'exchangeRatesController'
        })
        // route to the Home Page
        .otherwise({
            templateUrl : '/templates/home.html',
            controller  : 'mainController'
        });
});

mgfApp.controller('mainController', function($route, $routeParams, $location, $scope) {
    $('.nav li').removeClass('active');
    $('#navHome').addClass('active');
});

mgfApp.controller('servicesController', function($scope) {
    // Update the topmost navigation
    $('.nav li').removeClass('active');
    $('#navServices').addClass('active');
    $scope.current_view = '/templates/services_overview.html';
    
    $scope.services = [
        {
            id: 'service_moneyExchange',
            title: 'Money Exchange',
            short_description: 'For all your currency needs',
            templateUrl: '/templates/money_exchange.html',
            image_url: '/images/money-exchange.png'
        },
        {
            id: 'service_travelCards',
            title: 'Travel Cards',
            short_description: 'To travel without worrying about foreign currency',
            templateUrl: '/templates/travel_cards.html',
            image_url: '/images/travel-cards.png'
        },
        {
            id: 'service_moneyTransfer',
            title: 'Money Transfer',
            short_description: 'To transfer money across the world, instantly!',
            templateUrl: '/templates/money_transfer.html',
            image_url: '/images/money-transfer.png'
        },
        {
            id: 'service_goldCoins',
            title: 'Gold Coins',
            short_description: 'For Gift or Investment, certified Gold Coins in all designs',
            templateUrl: '/templates/gold_coins.html',
            image_url: '/images/gold-coin.png'
        }
    ]

    $scope.init = function(service) {
        console.log('Init from Service!');
        console.log('#' + service.id);
        // Update sidebar
        $('.sidebar .nav li').removeClass('active');
        console.log($('#' + service.id));
        $('#' + service.id).addClass('active');

        // Update the content panel
        $scope.current_view = service.templateUrl;
    }
});

mgfApp.controller('aboutController', function($scope) {
    $('.nav li').removeClass('active');
    $('#navAbout').addClass('active');
});

mgfApp.controller('contactController', function($scope) {
    $('.nav li').removeClass('active');
    $('#navContact').addClass('active');
});

mgfApp.controller('exchangeRatesController', function($scope, $http) {
    $scope.options = {
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    format: 'DD/MM/YYYY HH:mm:ss'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Date'
                }
            }],
            yAxes: [{
                type: 'linear',
                scaleLabel: {
                    display: true,
                    labelString: 'Value (In INR)'
                }
            }]
        },
        legend: {
            display: true
        }
    };

    $scope.refresh = function() {
        $http.get("/data/currentRates.json")
            .then( function(response) {
                $scope.currencyTable = response.data.Data;

                $scope.updateTime = response.data.Updated;
                $scope.series = [];
                $scope.data = [];

                $scope.currencyTable.forEach(function(currency) {
                    $scope.toggleVisibility(currency);
                }, this);
            }
        );
    }

    $scope.toggleVisibility = function(currency) {
        if (currency.Show) {
            console.log('Show!');
            console.log(currency);
            $scope.series.push(currency.Symbol);
            $scope.data.push(currency.Buy);
        } else {
            index = $scope.series.indexOf(currency.Symbol);
            if (index >= 0) {
                $scope.series.splice(index, 1);
                $scope.data.splice(index, 1);
            }
        }
    }

    $scope.refresh();
});

mgfApp.controller('ConverterController', function($scope, $http) {
    $http.get("/data/currentRates.json")
        .then( function(response) {
            $scope.currencyTable = response.data;
            $scope.init()
        });

    $scope.init = function() {
        $scope.fromCurrency = $scope.currencyTable[0];
        $scope.toCurrency = $scope.currencyTable[0];
        $scope.fromQuantity = 1;
        $scope.toQuantity = 1;
    }


    $scope.toChanged = function() {
        $scope.fromQuantity = ($scope.toQuantity * $scope.toCurrency.buy) / $scope.fromCurrency.buy;
    }
    $scope.fromChanged = function() {
        $scope.toQuantity = ($scope.fromQuantity * $scope.fromCurrency.buy) / $scope.toCurrency.buy;
    }
});

mgfApp.controller('CurrencyTableController', function($scope, $http) {
    $http.get("/data/currentRates.json")
        .then( function(response) {
            $scope.currencyTable = response.data;
        });
});