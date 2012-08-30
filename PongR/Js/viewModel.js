/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR viewmodels declaration with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $) {

    function getBallX(radius) {
        var x = $(".ball")[0].style.left;
        return x - radius;
    }

    function getBallY(radius) {
        var y = $(".ball")[0].style.top;
        return y - radius;
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

    myPongR.Player = function (user) {
        var self = this;
        self.user = new myPongR.User(user.Username, user.Id);
        self.barDirection = ""; // Can be up or down
        self.barMarginTop = 600; // %
        self.vertexes = []; // TODO getInitialPosition()
        self.score = 0;
    };

    myPongR.Ball = function (direction) {
        var self = this;
        self.radius = ($(".plot")[0].offsetWidth) / 2;
        self.Coordinates = new myPongR.Point(getBallX(radius), getBallY(radius)); 
        self.direction = direction; // can be left or right
    };

    myPongR.App = function (id, player1, player2, ballDirection) {
        var self = this;
        self.playRoomId = id;
        self.player1 = player1;
        self.player2 = player2;
        self.ball = new myPongR.Ball(ballDirection);
        self.field = []; // TODO getFieldVertexes()
    };

    return myPongR;
} (pongR, jQuery));
