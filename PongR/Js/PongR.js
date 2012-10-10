/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR namespace js file with the Module pattern
*/

// Module creation
var PongR = (function ($) {

    var self;

    function PongR(width, height, username) {
        self = this;
        this.settings = new this.Settings(width, height);
        this.pongRHub = $.connection.pongRHub;
        this.pongRHub.username = username;
        this.pongRHub.opponentLeft = opponentLeft;
        this.pongRHub.wait = wait;
        this.pongRHub.startMatch = startMatch;
    }

    // SignalR functions
    function opponentLeft() {
        alert("Opponent left. Going back to wait list");
        //pongR.clearAnimation(requestAnimationFrameRequestId);            
        // TODO Implement a method that resets the game: names, score, objects position (resetAllPositionsToInitialState())
    };

    function wait() {
        // TODO: Use a lightbox to display a waiting message
        alert("Wait. Do nothing.");
    };

    function startMatch(opts) {
        // TODO: Populate all the view models and do the binding with knockout.
        // Set the timeout to compute game state and for notifying bars position
        // Set event handlers for keystrokes keyUp and KeyDown
        // Start to animate the ball
        self.startMatch(opts);
    };

    // Receives an updated game state from the server. Being the server authoritative, means that we have to apply this state to our current state
    function updateGame(game) {
        //TODO
    }

    PongR.prototype.connect = function () {
        $.connection.hub.start()
                    .done(function () {
                        self.pongRHub.joined();
                    });
    };

    // sendInput(gameId : number, connectionId : string, input : PlayerInput) : void
    PongR.prototype.sendInput = function (gameId, connectionId, input) {
        this.pongRHub.queueInput(gameId, connectionId, input);
    }

    /*
    // Steps: 
    // 1: display a message and update score
    // 2: reset players and ball position    
    // 3: set new ball direction/angle
    // 4: reset notification interval
    pongRHub.continueMatchAfterGoal = function(opts) {
    pongR.displayGoalMessage(opts.PlayerNameWhoScored);
    pongR.updateScore(opts.PlayerNameWhoScored);
    pongR.resetObjectsPositionToInitialState();
    app.ball.direction = opts.BallDirection;
    if (opts.BallDirection === "left") {
    app.ball.angle = 180;
    }
    else {
    app.ball.angle = 0;
    }
    //pongR.setKeyboardEventListener();
    //requestAnimationFrameRequestId = pongR.startAnimation(pongR.processState);
    //serverNotificationIntervalId = pongR.startPositionNotificationInterval();   
    };    
    */

    // ViewModels
    PongR.prototype.Point = function (x, y) {
        this.x = x;
        this.y = y;
    };

    PongR.prototype.Viewport = function (width, height) {
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
        this.user = new self.User(user.Username, user.Id);
        this.playerNumber = playerNumber;
        this.barWidth = 30;
        this.barHeight = 96;
        this.topLeftVertex = null;
        if (playerNumber === 1) {
            this.topLeftVertex = new self.Point(50, 252);
        }
        else {
            this.topLeftVertex = new self.Point(fieldWidth - 50 - this.barWidth, 252);
        }
        this.barDirection = ""; // Can be empty (i.e. not moving), up or down
        this.inputs = []; // Local history of inputs for this client. Each input is of type myPongR.Input
        this.score = ko.observable(0);
        this.lastProcessedInputId = -1;
    };

    PongR.prototype.Ball = function (direction, fieldWidth, fieldHeight) {
        this.radius = 20;
        this.position = new self.Point(fieldWidth / 2, fieldHeight / 2); // The ball starts at the center of the field
        this.direction = direction; // can be left or right        
        this.angle = (direction === "right" ? 0 : 180);
    };

    PongR.prototype.Settings = function (width, height) {
        this.viewport = new self.Viewport(width, height); // The viewport size as passed by the client
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
        this.player1 = new self.Player(player1, 1);
        this.player2 = new self.Player(player2, 2);
        this.ball = new self.Ball(ballDirection, self.settings.viewport.width, self.settings.viewport.height);
    };

    return PongR;
} (jQuery));