/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR viewmodels declaration with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $) {

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
    }

    myPongR.Player = function (user) {
        var self = this;
        self.user = user;        
        self.barDirection = ""; // Can be up or down
        self.barMarginTop = 600; // %
        self.vertexes = []; // TODO getInitialPosition()
        self.score = 0;
    };

    myPongR.Ball = function (x, y, direction) {
        var self = this;
        self.x = x;
        self.y = y;
        self.direction = direction; // can be left or right
    };

    myPongR.App = function (player1, player2, ball) {
        var self = this;
        self.player1 = player1;
        self.player2 = player2;
        self.ball = ball;
        self.field = []; // TODO getFieldVertexes()
    };

    return myPongR;
} (pongR, jQuery));
