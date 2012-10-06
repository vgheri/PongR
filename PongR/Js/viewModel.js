/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR viewmodels declaration with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $, ko) {

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

    myPongR.Input = function (commands, sequenceNumber) {
        var self = this;
        self.commands = commands;
        self.sequenceNumber = sequenceNumber;
    };

    myPongR.Player = function (user, playerNumber, fieldWidth) {
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

    myPongR.Ball = function (direction, fieldWidth, fieldHeight) {
        var self = this;
        self.radius = 20;
        self.position = new myPongR.Point(fieldWidth / 2, fieldHeight / 2); // The ball starts at the center of the field
        self.direction = direction; // can be left or right        
        self.angle = (direction === "right" ? 0 : 180);
    };

    myPongR.Settings = function () {
        var self = this;
        self.naive_approach = true; // default : true. Means we won't use lag compensation
        self.client_prediction = true;
        self.input_sequence = 0; //When predicting client inputs, we store the last input as a sequence number        
        self.client_smoothing = false;  //Whether or not the client side prediction tries to smooth things out
        self.client_smooth = 25;        //amount of smoothing to apply to client update dest
        self.gap = 30; // px. Minimum distance between the player and the field delimiters (up and down)
    };

    myPongR.App = function (id, player1, player2, ballDirection) {
        var self = this; // Instance of the game        
        self.gameId = id;
        self.player1 = new myPongR.Player(player1, 1);
        self.player2 = new myPongR.Player(player2, 2);
        self.fieldWidth = 1000; // Proposal: Move the two following properties inside settings
        self.fieldHeight = 600;
        self.ball = new myPongR.Ball(ballDirection, self.fieldWidth, self.fieldHeight);        
        self.settings = new myPongR.Settings();
    };

    return myPongR;
} (pongR, jQuery, ko));
