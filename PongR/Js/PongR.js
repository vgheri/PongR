/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR namespace js file with the Module pattern
*/

// Module creation
var PongR = (function ($) {

    function PongR(width, height) {        
        var viewPort = new this.ViewPort(width, height);
        this.settings = new this.Settings(viewPort);
    }

    // ViewModels
    PongR.prototype.Point = function (x, y) {        
        this.x = x;
        this.y = y;
    };

    PongR.prototype.ViewPort = function (width, height) {        
        this.width = width;
        this.height = height;
    };

    PongR.prototype.User = function (username, connectionId) {        
        this.username = ko.observable(username);
        this.connectionId = connectionId;
    };

    PongR.prototype.Input = function (commands, sequenceNumber) {        
        this.commands = commands;
        this.sequenceNumber = sequenceNumber;
    };

    PongR.prototype.Player = function (user, playerNumber, fieldWidth) {        
        this.user = new myPongR.User(user.Username, user.Id);
        this.playerNumber = playerNumber;
        this.barWidth = 30;
        this.barHeight = 96;
        this.topLeftVertex = null;
        if (playerNumber === 1) {
            this.topLeftVertex = new this.Point(50, 252);
        }
        else {
            this.topLeftVertex = new this.Point(fieldWidth - 50 - this.barWidth, 252);
        }
        this.barDirection = ""; // Can be empty (i.e. not moving), up or down
        this.inputs = []; // Local history of inputs for this client. Each input is of type myPongR.Input
        this.score = ko.observable(0);
        this.lastProcessedInputId = -1;
    };

    PongR.prototype.Ball = function (direction, fieldWidth, fieldHeight) {        
        this.radius = 20;
        this.position = new this.Point(fieldWidth / 2, fieldHeight / 2); // The ball starts at the center of the field
        this.direction = direction; // can be left or right        
        this.angle = (direction === "right" ? 0 : 180);
    };

    PongR.prototype.Settings = function (viewPort) {        
        this.viewPort = viewPort; // The viewport size as passed by the client
        this.naive_approach = true; // default : true. Means we won't use lag compensation
        this.client_prediction = true;
        this.input_sequence = 0; //When predicting client inputs, we store the last input as a sequence number        
        this.client_smoothing = false;  //Whether or not the client side prediction tries to smooth things out
        this.client_smooth = 25;        //amount of smoothing to apply to client update dest
        this.gap = 30; // px. Minimum distance between the player and the field delimiters (up and down)
        this.BAR_SCROLL_UNIT = 5; // px
        this.BALL_FIXED_STEP = 10; // px is the fixed distance that the ball moves (both over x and y axis) between 2 frames
    };

    PongR.prototype.Game = function (id, player1, player2, ballDirection) {        
        this.gameId = id;
        this.player1 = new this.Player(player1, 1);
        this.player2 = new this.Player(player2, 2);        
        this.ball = new this.Ball(ballDirection, this.fieldWidth, this.fieldHeight);
    };

    return PongR;
} (jQuery));