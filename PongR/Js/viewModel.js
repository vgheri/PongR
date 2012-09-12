/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR viewmodels declaration with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $) {

    function getElementTopLeftVertex(element) {
        var x, y;
        x = element.offsetLeft;
        y = element.offsetTop;
        return new myPongR.Point(x, y);
    }

    // ViewModels
    myPongR.Point = function (x, y) {
        var self = this;
        self.x = x;
        self.y = y;
    };

    myPongR.User = function (username, connectionId) {
        var self = this;
        self.username = ko.observable(username);
        self.connectionId = connectionId;
    };

    myPongR.Player = function (user, playerNumber) {
        var self = this;
        var element = null;
        if (playerNumber === 1) {
            element = $("#player1-bar")[0];
        }
        else {
            element = $("#player2-bar")[0];
        }
        self.user = new myPongR.User(user.Username, user.Id);
        self.playerNumber = playerNumber;
        self.barDirection = ""; // Can be empty (bar doesn't move), up or down
        self.barMarginTop = ko.observable(37); // %
        self.topLeftVertex = getElementTopLeftVertex(element);
        self.barWidth = $(".player-bar")[0].offsetWidth;
        self.barHeight = $(".player-bar")[0].offsetHeight;
        self.score = ko.observable(0);
    };

    myPongR.Ball = function (direction) {
        var self = this;
        var element = $("#ball")[0];
        self.radius = element.offsetWidth / 2;
        var tempPoint = getElementTopLeftVertex(element);
        var center = new myPongR.Point(tempPoint.x - self.radius, tempPoint.y - self.radius);
        self.coordinates = center;
        self.direction = direction; // can be left or right        
        self.angle = (direction === "right" ? 0 : 180);
        self.fixedStep = 5; // 5px is the fixed distance that the ball moves (both over x and y axis) between 2 frames
    };

    myPongR.App = function (id, player1, player2, ballDirection) {
        var self = this;
        var element = $("#player1-field")[0];
        self.playRoomId = id;
        self.player1 = new myPongR.Player(player1, 1);
        self.player2 = new myPongR.Player(player2, 2);
        self.ball = new myPongR.Ball(ballDirection);
        self.fieldTopLeftVertex = getElementTopLeftVertex(element);
        self.fieldWidth = element.offsetWidth * 2;
        self.fieldHeight = element.offsetHeight;
        self.getMarginTop = function (player) {
            return player.barMarginTop().toString() + "%";
        };
    };

    return myPongR;
} (pongR, jQuery));
