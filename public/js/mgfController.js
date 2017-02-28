// create the module and name it scotchApp
var mgfApp = angular.module('mgfApp', ['ngRoute']);

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
        },
    ]

    $scope.init = function(service) {
        // Update sidebar
        $('.sidebar .sidebar-nav li').removeClass('active');
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
    $http.get("/data/currentRates.json")
        .then( function(response) {
            $scope.currencyTable = response.data;
            $scope.init()
        });
    
    $scope.init = function() {
        var ctx = document.getElementById("historyChart").getContext("2d");
        config = {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                title:{
                    text: "Foreign Currency Value Over Time"
                },
                scales: {
                    xAxes: [{
                        type: "time",
                        time: {
                            // time format
                            format: 'DD/MM/YYYY HH:mm:ss',
                            // round: 'day'
                            tooltipFormat: 'll HH:mm:ss'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }, ],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Value (In INR)'
                        }
                    }]
                },
            }
        }

        $scope.historyChart = new Chart(ctx, config);

        for (index in $scope.currencyTable) {
            currency = $scope.currencyTable[index]
            console.log(currency);
            if (currency.show) {
                addCurrency(currency);
                console.log($scope.historyChart);
            }
        }
    }

    $scope.update = function(currency) {
        if (currency.show) {
            addCurrency(currency);
        } else {
            $scope.historyChart.config.data.datasets = $scope.historyChart.config.data.datasets.filter(function(dataset) {
                return dataset.label != currency.symbol;
            });
        }
        $scope.historyChart.update();
    }

    addCurrency = function(currency) {
        var newColor = 'rgb(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ')';
        $scope.historyChart.config.data.datasets.push({
            label: currency.symbol,
            tension: 0,
            fill: false,
            data: [],
            borderColor: newColor,
            backgroundColor: Chart.helpers.color(newColor).alpha(0.5).rgbString(),
        });

        for (i = 0; i < currency.buyHistory.length; i++) {
            $scope.historyChart.config.data.datasets[$scope.historyChart.config.data.datasets.length - 1].data.push({
                // Time format must match the above timeformat 'DD/MM/YYYY HH:mm'
                x: currency.buyHistory[i].date,
                y: currency.buyHistory[i].value
            });
        }
    }
});