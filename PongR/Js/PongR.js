/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR namespace js file with the Module pattern
*/

// Module creation
var PongR = (function ($) {

    function PongR(width, height) {
        var self = this;
        var viewPort = new ViewPort(width, height);
        self.settings = new myPongR.Settings(viewPort);
    }

    // ViewModels
    PongR.prototype.Point = function (x, y) {
        var self = this;
        self.x = x;
        self.y = y;
    };

    PongR.prototype.ViewPort = function (width, height) {
        var self = this;
        self.width = width;
        self.height = height;
    };

    PongR.prototype.User = function (username, connectionId) {
        var self = this;
        self.username = ko.observable(username);
        self.connectionId = connectionId;
    };

    PongR.prototype.Input = function (commands, sequenceNumber) {
        var self = this;
        self.commands = commands;
        self.sequenceNumber = sequenceNumber;
    };

    PongR.prototype.Player = function (user, playerNumber, fieldWidth) {
        var self = this;
        self.user = new myPongR.User(user.Username, user.Id);
        self.playerNumber = playerNumber;
        self.barWidth = 30;
        self.barHeight = 96;
        self.topLeftVertex = null;
        if (playerNumber === 1) {
            self.topLeftVertex = new myPongR.Point(50, 252);
        }
        else {
            self.topLeftVertex = new myPongR.Point(fieldWidth - 50 - self.barWidth, 252);
        }
        self.barDirection = ""; // Can be empty (i.e. not moving), up or down
        self.inputs = []; // Local history of inputs for this client. Each input is of type myPongR.Input
        self.score = ko.observable(0);
        self.lastProcessedInputId = -1;
    };

    PongR.prototype.Ball = function (direction, fieldWidth, fieldHeight) {
        var self = this;
        self.radius = 20;
        self.position = new myPongR.Point(fieldWidth / 2, fieldHeight / 2); // The ball starts at the center of the field
        self.direction = direction; // can be left or right        
        self.angle = (direction === "right" ? 0 : 180);
    };

    PongR.prototype.Settings = function (viewPort) {
        var self = this;
        self.viewPort = viewPort; // The viewport size as passed by the client
        self.naive_approach = true; // default : true. Means we won't use lag compensation
        self.client_prediction = true;
        self.input_sequence = 0; //When predicting client inputs, we store the last input as a sequence number        
        self.client_smoothing = false;  //Whether or not the client side prediction tries to smooth things out
        self.client_smooth = 25;        //amount of smoothing to apply to client update dest
        self.gap = 30; // px. Minimum distance between the player and the field delimiters (up and down)
        self.BAR_SCROLL_UNIT = 5; // px
        self.BALL_FIXED_STEP = 10; // px is the fixed distance that the ball moves (both over x and y axis) between 2 frames
    };

    PongR.prototype.Game = function (id, player1, player2, ballDirection) {
        var self = this; // Instance of the game        
        self.gameId = id;
        self.player1 = new myPongR.Player(player1, 1);
        self.player2 = new myPongR.Player(player2, 2);        
        self.ball = new myPongR.Ball(ballDirection, self.fieldWidth, self.fieldHeight);
    };

    return PongR;
} (jQuery));