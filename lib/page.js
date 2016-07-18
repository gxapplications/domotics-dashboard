"use strict"

const Nes = require('nes')

window.app.controller("PageControls", function($scope, $http, $window, $mdToast) {
    $scope.edition = {
        active: false,
        close: () => {
            $scope.edition.active = false;
        },
        open: () => {
            $scope.edition.active = true;
        }
    };
    // TODO: placer la var context dans $scope.context, en utilisant un 'toJson'?
    // TODO: register here with a socket, and listen to update $scope.context :)
    $scope.shrinkable = true
    $scope.todos = [];
    for (var i = 0; i < 26; i++) {
        $scope.todos.push({
            what: "Brunch this weekend?",
            who: "Min Li Chan",
            notes: "I'll be in your neighborhood doing errands."
        });
    }

})
