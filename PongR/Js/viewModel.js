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
        x = element.style.left;
        y = element.style.top;
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
        self.username = username;
        self.connectionId = connectionId;
    };

    myPongR.Player = function (user, playerNumber) {
        var self = this;
        var element = null;
        if (playerNumber === 1) {
            element = $("#player1-bar");
        }
        else {
            element = $("#player2-bar");
        }
        self.user = new myPongR.User(user.Username, user.Id);
        self.playerNumber = playerNumber;
        self.barDirection = ""; // Can be up or down
        self.barMarginTop = 600; // %
        self.topLeftVertex = getElementTopLeftVertex(element);
        self.barWidth = $(".player-bar")[0].offsetWidth;
        self.barHeight = $(".player-bar")[0].offsetHeight;
        self.score = 0;
    };

    myPongR.Ball = function (direction) {
        var self = this;
        self.radius = ($(".ball")[0].offsetWidth) / 2;
        var element = $(".ball")[0];
        var tempPoint = getElementTopLeftVertex(element);
        var center = new myPongR.Point(tempPoint.x - radius, tempPoint.y - radius);
        self.Coordinates = center;
        self.direction = direction; // can be left or right
    };

    myPongR.App = function (id, player1, player2, ballDirection) {
        var self = this;
        var element = $("#fieldContainer");
        self.playRoomId = id;
        self.player1 = new myPongR.Player(player1, 1);
        self.player2 = new myPongR.Player(player2, 2);
        self.ball = new myPongR.Ball(ballDirection);
        self.fieldTopLeftVertex = getElementTopLeftVertex(element);
        self.fieldWidth = $("#fieldContainer").offsetWidth;
        self.fieldHeight = $("#fieldContainer").offsetHeight;
    };

    return myPongR;
} (pongR, jQuery));
