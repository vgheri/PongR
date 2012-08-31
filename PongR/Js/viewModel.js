/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR viewmodels declaration with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $) {

    /*
    function getBallX(radius) {
    var x = $(".ball")[0].style.left;
    return x - radius;
    }

    function getBallY(radius) {
    var y = $(".ball")[0].style.top;
    return y - radius;
    }

    function getGetBarVertex(playerNumber) {
    var x, y;
    if (playerNumber === 1) {
    x = $("#player1-bar").style.left;
    y = $("#player1-bar").style.top;
    }
    else {
    x = $("#player2-bar").style.left;
    y = $("#player2-bar").style.top;
    }
    return new myPongR.Point(x, y);
    }

    function getFieldTopLeftVertex() {
    var x, y;
    x = $("#fieldContainer").style.left;
    y = $("#fieldContainer").style.top;
    return new myPongR.Point(x, y);
    }
    */

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
        self.barDirection = ""; // Can be up or down
        self.barMarginTop = ko.observable(600); // %
        self.topLeftVertex = getElementTopLeftVertex(element);
        self.barWidth = $(".player-bar")[0].offsetWidth;
        self.barHeight = $(".player-bar")[0].offsetHeight;
        self.score = ko.observable(0);
    };

    myPongR.Ball = function (direction) {
        var self = this;
        var element = $(".ball")[0];
        self.radius = element.offsetWidth / 2;
        var tempPoint = getElementTopLeftVertex(element);
        var center = new myPongR.Point(tempPoint.x - self.radius, tempPoint.y - self.radius);
        self.Coordinates = center;
        self.direction = direction; // can be left or right
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
