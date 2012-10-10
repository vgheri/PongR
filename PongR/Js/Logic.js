/*
* Author: Valerio Gheri
* Date: 8/10/2012
* Description: PongR game logic definition with the Module Augmentation pattern
*/

var PongR = (function (PongR, $, ko) {
    var me;
    var keyboard;
    var requestAnimationFrameRequestId;
    var physicsLoopId;

    this.startAnimation = function() {
        requestAnimationFrameRequestId = window.requestAnimationFrame(this.startUpdateLoop);
    };

    this.clearAnimation = function() {
        window.cancelAnimationFrame(requestAnimationFrameRequestId);
    };

    this.startPhysicsLoop = function() {
        //physicsLoopId = window.setInterval(this.updatePhysics, 15);
        //physicsLoopId = setInterval(function () { this.updatePhysics(); }, 15);
        physicsLoopId =  setInterval((function (self) {
            return function () { self.updatePhysics(); } 
        })(this),
        15);
    };

    this.clearPhysicsLoop = function() {
        window.setInterval(physicsLoopId);
    };

    //calculateNewAngleAfterPlayerHit(player : Player, newBallDirection : string) : number
    //Calculates new angle after a ball collision with a player
    PongR.prototype.calculateNewAngleAfterPlayerHit = function (player, newBallDirection) {
        var angle;
        if (newBallDirection === "right" && player.barDirection === "") {
            angle = 0;
        }
        else if (newBallDirection === "right" && player.barDirection === "up") {
            angle = 45;
        }
        else if (newBallDirection === "left" && player.barDirection === "up") {
            angle = 135;
        }
        else if (newBallDirection === "left" && player.barDirection === "") {
            angle = 180;
        }
        else if (newBallDirection === "left" && player.barDirection === "down") {
            angle = 225;
        }
        else if (newBallDirection === "right" && player.barDirection === "down") {
            angle = 315;
        }
        else {
            console.log("Error! Unkown new angle value: hit on player :" + player.playerNumber.toString() + ". New ball direction: " + newBallDirection + ". Player direction: " + (player.barDirection !== "" ? player.barDirection : "none"));
            return undefined;
        }
        return angle;
    };

    //calculateNewAngleAfterFieldHit(oldAngle : number, ballDirection : string) : number
    //Calculates new angle after a ball collision with the field
    PongR.prototype.calculateNewAngleAfterFieldHit = function (oldAngle, ballDirection) {
        var newAngle;
        if (ballDirection === "right" && oldAngle === 45) {
            newAngle = 315;
        }
        else if (ballDirection === "right" && oldAngle === 315) {
            newAngle = 45;
        }
        else if (ballDirection === "left" && oldAngle === 135) {
            newAngle = 225;
        }
        else if (ballDirection === "left" && oldAngle === 225) {
            newAngle = 135;
        }
        else {
            console.log("Unknown new angle value upon hit on field delimiters. Ball direction: " + ballDirection + ". Ball old angle: " + oldAngle);
            return undefined;
        }
        return newAngle;
    };

    //checkCollisionWithPlayer(player : Player, ball : Ball) : boolean 
    //Check if the ball hits one of the player
    PongR.prototype.checkCollisionWithPlayer = function (player, ball) {
        var collision = false;

        // If player is on the left, then we need to substract the radius, otherwise add
        var relativeRadius = player.playerNumber === 1 ? (0 - ball.radius) : ball.radius;

        if (player.topLeftVertex.x <= ball.position.x + relativeRadius && player.topLeftVertex.x + player.barWidth >= ball.position.x + relativeRadius) {
            if ((player.topLeftVertex.y <= ball.position.y + ball.radius)
                && (player.topLeftVertex.y + player.barHeight >= ball.position.y - ball.radius)) {
                collision = true;
            }
        }

        return collision;
    };

    //checkCollisionWithFieldDelimiters(ball : Ball, fieldWidth : number, fieldHeight : number) : boolean
    //Check if the ball hits one of the sides of the field 
    PongR.prototype.checkCollisionWithFieldDelimiters = function (ball, fieldWidth, fieldHeight) {
        var collision = false;
        // Hit check. I check first for y axis because it's less frequent that the condition will be true, so most of the time 
        // we check only 1 if statement instead of 2 
        // We consider a hit when the ball is very close to the field delimiter (+/-5 px)
        if ((ball.position.y - ball.radius >= -5 && ball.position.y - ball.radius <= 5) ||
                (ball.position.y + ball.radius >= fieldHeight - 5 && ball.position.y + ball.radius <= fieldHeight + 5)) {
            if (ball.position.x - ball.radius >= 0 && ball.position.x + ball.radius <= fieldWidth) {
                collision = true;
            }
        }

        return collision;
    };

    //updateBallPosition(angle, position) : Point 
    //Updates the position of the ball based on its direction and its angle
    PongR.prototype.updateBallPosition = function (angle, position) {
        var newPosition = { x: position.x, y: position.y };
        switch (angle) {
            case 0:
                newPosition.x = position.x + this.settings.BALL_FIXED_STEP;
                break;
            case 45:
                newPosition.x = position.x + this.settings.BALL_FIXED_STEP;
                newPosition.y = position.y - this.settings.BALL_FIXED_STEP;
                break;
            case 135:
                newPosition.x = position.x - this.settings.BALL_FIXED_STEP;
                newPosition.y = position.y - this.settings.BALL_FIXED_STEP;
                break;
            case 180:
                newPosition.x = position.x - this.settings.BALL_FIXED_STEP;
                break;
            case 225:
                newPosition.x = position.x - this.settings.BALL_FIXED_STEP;
                newPosition.y = position.y + this.settings.BALL_FIXED_STEP;
                break;
            case 315:
                newPosition.x = position.x + this.settings.BALL_FIXED_STEP;
                newPosition.y = position.y + this.settings.BALL_FIXED_STEP;
                break;
            default:
                console.log("Unknown angle value " + this.game.ball.angle.toString());
                return undefined;
        }
        return newPosition;
    };

    //process_input(player : Player) : number 
    //Computes the increment on the Y axis, given a player list of inputs
    PongR.prototype.process_input = function (player) {
        //It's possible to have received multiple inputs by now, so we process each one        
        // Each input is an object structured like:
        // commands: list of commands (i.e. a list of "up"/"down")
        // sequenceNumber: the sequence number for this batch of inputs
        var y_dir = 0;
        var ic = player.inputs.length;
        if (ic) {
            for (var j = 0; j < ic; ++j) {
                //don't process ones we already have simulated locally
                if (player.inputs[j].sequenceNumber <= player.lastProcessedInputId) continue;

                var input = player.inputs[j].commands;
                var c = input.length;
                for (var i = 0; i < c; ++i) {
                    var key = input[i];
                    if (key == 'up') {
                        y_dir -= this.settings.BAR_SCROLL_UNIT;
                        player.barDirection = "up";
                    }
                    else if (key == 'down') {
                        y_dir += this.settings.BAR_SCROLL_UNIT;
                        player.barDirection = "down";
                    }
                } //for all input values

            } //for each input command
        } //if we have inputs
        else {
            // We didn't move
            player.barDirection = "";
        }

        if (player.inputs.length) {
            //we can now update the sequence number for the last batch of input processed 
            // and then clear the array since these have been processed            
            player.lastProcessedInputId = player.inputs[ic - 1].sequenceNumber;
            player.inputs.splice(0, ic);
        }

        //give it back
        return y_dir;
    };

    //updateSelfPosition(topLeftVertex : Point, yIncrement : number, fieldHeight : number, settings.gap : number) : Point 
    // Updates self position. If we are not too close, we move completely, otherwise we are set to the gap
    // Gap is defined as the minimum distance between the player and the field delimiters (up and down) is 30 px
    PongR.prototype.updateSelfPosition = function (topLeftVertex, yIncrement, fieldHeight, gap) {
        var newTopLeftVertex = { x: topLeftVertex.x, y: topLeftVertex.y };
        if ((topLeftVertex.y + yIncrement >= gap) && (topLeftVertex.y + yIncrement <= fieldHeight - gap)) {
            newTopLeftVertex.y += yIncrement;
        }
        else if (topLeftVertex.y + yIncrement < gap) {
            newTopLeftVertex.y = gap;
        }
        else {
            newTopLeftVertex.y = fieldHeight - gap;
        }
        return newTopLeftVertex;
    };

    // PRIVATE
    // Draws a frame of the game: the two players and the ball
    function draw() {
        drawField();
        drawPlayer(this.game.player1);
        drawPlayer(this.game.player1);
        drawBall();
    };

    function drawField() {
        //Set the color for this player
        this.canvasContext.fillStyle = "#111111"; // Almost Black
        //Draw a rectangle for us
        this.canvasContext.fillRect(0, 0, this.settings.viewport.width, this.settings.viewport.height);
    };

    function drawBall() {
        //Set the color for this player
        this.canvasContext.fillStyle = "#EE0000"; // Red
        //Draw a circle for us
        this.canvasContext.arc(this.game.ball.position.x, this.game.ball.position.y, this.game.ball.radius, 0, 2 * Math.PI);
    };

    function drawPlayer(player) {
        //Set the color for this player
        this.canvasContext.fillStyle = "#00FF00"; // Light Green
        //Draw a rectangle for us
        this.canvasContext.fillRect(player.topLeftVertex.x, player.topLeftVertex.y, player.barWidth, player.barHeight);
    };

    // This takes input from the client and keeps a record. 
    // It also sends the input information to the server immediately
    // as it is pressed. It also tags each input with a sequence number.
    PongR.prototype.handleClientInputs = function (player) {

        var input = [];
        this.client_has_input = false; // TODO check why this variable is public
        var playerInput = null;

        if (keyboard.pressed('up')) {
            input.push('up');
        } // up

        if (keyboard.pressed('down')) {
            input.push('down');
        } // down

        if (input.length) {

            //Update what sequence we are on now
            this.settings.input_sequence += 1;

            //Store the input state as a snapshot of what happened.
            playerInput = {
                sequenceNumber: this.input_seq,
                commands: input
            };

            me.inputs.push(playerInput);
        }

        return playerInput;
    };

    // A single step of the client update loop (a frame)
    PongR.prototype.updateLoopStep = function () {
        // Step 1: Clear canvas
        this.canvasContext.clearRect(0, 0, this.settings.viewport.width, this.settings.viewport.height);
        // Step 2: Handle user inputs (update internal model)
        var playerInput = this.handleClientInputs(me);
        if (playerInput !== null) {
            // Step 3: Send the just processed input batch to the server.
            this.sendInput(game.gameId, me.user.connectionId, playerInput);
        }
        // Step 3: Draw the new frame in the canvas
        draw(game, this.canvasContext);
    };

    // Starts the client update loop 
    PongR.prototype.startUpdateLoop = function () {
        updateLoopStep();

        // From MDN https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame  
        // Your callback routine must itself call requestAnimationFrame() unless you want the animation to stop.
        // We use requestAnimationFrame so that the the image is redrawn as many times as possible per second
        requestAnimationFrameRequestId = this.startAnimation(startUpdateLoop);
    };

    // PRIVATE - At each step of the game, checks for any collision, and updates the app internal state
    function checkForCollisionsAndUpdateBallState() {
        var collision = false;
        var newAngle = -1;
        // if collision with players' bar or field, update ball state (set next angle, next direction etc...)
        collision = this.checkCollisionWithPlayers(this.game.player1);
        if (collision) {
            this.game.ball.direction = "right";
            this.game.ball.angle = this.calculateNewAngleAfterPlayerHit(this.game.player1, this.game.ball.direction);
        }
        else {
            collision = this.checkCollisionWithPlayers(this.game.player2);
            if (collision) {
                this.game.ball.direction = "left";
                this.game.ball.angle = this.calculateNewAngleAfterPlayerHit(this.game.player2, this.game.ball.direction);
            }
            // No collision with players, let's check if we have a collision with the field delimiters
            else {
                collision = this.checkCollisionWithFieldDelimiters(this.game.ball, this.settings.viewport.width, this.settings.viewport.height);
                if (collision) {
                    this.game.ball.angle = this.calculateNewAngleAfterFieldHit(this.game.ball.angle, this.game.ball.direction);
                }
            }
        }
    };

    PongR.prototype.updatePhysics = function () {
        // 1: updates self position and direction
        //var yIncrement = this.process_input(me);
        var yIncrement = PongR.prototype.process_input(me);
        var newPosition = PongR.prototype.updateSelfPosition(me.topLeftVertex, yIncrement, this.settings.viewport.heigth, this.settings.gap);
        me.topLeftVertex = newPosition;
        // 2: update ball position
        var newPosition = PongR.prototype.updateBallPosition(this.game.ball.angle, this.game.ball.position);
        this.game.ball.position = newPosition;
        // 2: check collision
        checkForCollisionsAndUpdateBallState();
    };

    // Initial setup of the match state and start of the game interval
    PongR.prototype.startMatch = function (opts) {
        // Proposal: app is now a global var... make it private
        this.game = new this.Game(opts.PlayRoomId, opts.Player1, opts.Player2, opts.BallDirection);

        // Proposal: I can extract the following blocks of code into a function to retrieve the current canvas context
        // Set the canvas dimensions
        var canvas = document.getElementById("viewport");
        canvas.width = this.settings.viewport.width;
        canvas.height = this.settings.viewport.height;

        // Get the 2d context to draw on the canvas
        // getContext() returns an object that provides methods and properties for drawing on the canvas.
        this.canvasContext = canvas.getContext("2d");
        this.canvasContext.font = '11px "Helvetica"';

        if (opts.Player1.Username === this.pongRHub.username) {
            me = this.game.player1;
        }
        else {
            me = this.game.player2;
        }

        ko.applyBindings(this.game);

        // Start the physics loop
        this.startPhysicsLoop();

        // Initialise keyboard handler
        keyboard = new THREEx.KeyboardState();

        //A list of recent server updates
        this.serverUpdates = [];

        // Start the update loop
        this.startUpdateLoop();
    };

    return PongR;
} (PongR, jQuery, ko));