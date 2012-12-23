/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR namespace js file with the Module pattern
*/

// Module creation
var PongR = (function ($, ko) {

    // IE doesn't parse IS8601 formatted dates, so I had to find this function to parse it
    // (URL http://dansnetwork.com/javascript-iso8601rfc3339-date-parser/ )
    Date.prototype.setISO8601 = function (dString) {

        var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

        if (dString.toString().match(new RegExp(regexp))) {
            var d = dString.match(new RegExp(regexp));
            var offset = 0;

            this.setUTCDate(1);
            this.setUTCFullYear(parseInt(d[1], 10));
            this.setUTCMonth(parseInt(d[3], 10) - 1);
            this.setUTCDate(parseInt(d[5], 10));
            this.setUTCHours(parseInt(d[7], 10));
            this.setUTCMinutes(parseInt(d[9], 10));
            this.setUTCSeconds(parseInt(d[11], 10));
            if (d[12])
                this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
            else
                this.setUTCMilliseconds(0);
            if (d[13] != 'Z') {
                offset = (d[15] * 60) + parseInt(d[17], 10);
                offset *= ((d[14] == '-') ? -1 : 1);
                this.setTime(this.getTime() - offset * 60 * 1000);
            }
        }
        else {
            this.setTime(Date.parse(dString));
        }
        return this;
    };

    Date.prototype.getUTCTime = function (date) {
        var isoDate = new Date();
        isoDate.setISO8601(date);
        return new Date(isoDate.getTime() + (isoDate.getTimezoneOffset() * 60000)).getTime();
    };

    var pongR = {
        PublicPrototype: { UnitTestPrototype: {} }
    };

    // Used in the logic section    
    var keyboard;
    var requestAnimationFrameRequestId;
    var physicsLoopId;

    // Models
    function Point(x, y) {
        this.x = x;
        this.y = y;
    };

    function Viewport(width, height) {
        this.width = width;
        this.height = height;
    };

    function User(username, connectionId) {
        this.username = ko.observable(username);
        this.connectionId = connectionId;
    };

    function Input(commands, sequenceNumber) {
        this.commands = commands;
        this.sequenceNumber = sequenceNumber;
    };

    function Player(user, playerNumber, fieldWidth) {
        var self = this;
        this.user = new User(user.Username, user.Id);
        this.playerNumber = playerNumber;
        this.barWidth = 30;
        this.barHeight = 96;
        this.topLeftVertex = null;
        if (playerNumber === 1) {
            this.topLeftVertex = new Point(50, 252);
        }
        else {
            var xValue = fieldWidth - 50 - this.barWidth;
            this.topLeftVertex = new Point(xValue, 252);
        }
        this.barDirection = ""; // Can be empty (i.e. not moving), up or down
        this.inputs = []; // Local history of inputs for this client. Each input is of type myPongR.Input
        this.score = ko.observable(0);
        this.lastProcessedInputId = -1;
        this.resetPositionAndDirection = function (fieldWidth) {
            self.barDirection = "";
            if (self.playerNumber === 1) {
                self.topLeftVertex = new Point(50, 252);
            }
            else {
                var xValue = fieldWidth - 50 - self.barWidth;
                self.topLeftVertex = new Point(xValue, 252);
            }
        };
    };

    function Ball(direction, fieldWidth, fieldHeight) {
        var self = this;
        this.radius = 10;
        this.position = new Point(fieldWidth / 2, fieldHeight / 2); // The ball starts at the center of the field
        this.direction = direction; // can be left or right        
        this.angle = (direction === "right" ? 0 : 180);
        this.resetPositionDirectionAndAngle = function (fieldWidth, fieldHeight, direction, angle) {
            self.position = new Point(fieldWidth / 2, fieldHeight / 2);
            self.direction = direction;
            self.angle = angle;
        };
    };

    function Settings(width, height) {
        this.viewport = new Viewport(width, height); // The viewport size as passed by the client
        this.naive_approach = false; // default : true. Means we won't use lag compensation
        this.client_prediction = true;
        this.net_offset = 100; // ms we are behind the server in updating the other client position
        this.updates_buffer_size = 1; // seconds worth of udpates
        this.input_sequence = 0; //When predicting client inputs, we store the last input as a sequence number        
        //this.client_smoothing = false;  //Whether or not the client side prediction tries to smooth things out
        //this.client_smooth = 25;        //amount of smoothing to apply to client update dest
        this.gap = 30; // px. Minimum distance between the player and the field delimiters (up and down)
        this.BAR_SCROLL_UNIT = 330; // desired speed: pixels per second
        this.BALL_FIXED_STEP = 400; // desired speed: pixels per second
        this.PAUSE_AFTER_GOAL = 3; // seconds
    };

    function Game(id, player1, player2, ballDirection) {
        this.gameId = id;
        this.player1 = new Player(player1, 1, pongR.settings.viewport.width);
        this.player2 = new Player(player2, 2, pongR.settings.viewport.width);
        this.ball = new Ball(ballDirection, pongR.settings.viewport.width, pongR.settings.viewport.height);
        this.destroy = function () {
            var self = this;
            self.gameId = "";
            self.player1 = {};
            self.player2 = {};
            self.ball = {};
        };
    };

    // Logic

    function startAnimation() {
        requestAnimationFrameRequestId = window.requestAnimationFrame(startUpdateLoop);
    };

    function clearAnimation() {
        window.cancelAnimationFrame(requestAnimationFrameRequestId);
    };

    function startPhysicsLoop() {
        physicsLoopId = window.setInterval(updatePhysics, 15);
    };

    function clearPhysicsLoop() {
        window.setInterval(physicsLoopId);
    };

    function updatePlayerState(clientPlayer, serverPlayer) {
        clientPlayer.barDirection = serverPlayer.BarDirection;
        clientPlayer.topLeftVertex.x = convertToPixels(serverPlayer.TopLeftVertex.X);
        clientPlayer.topLeftVertex.y = convertToPixels(serverPlayer.TopLeftVertex.Y);
        clientPlayer.score(serverPlayer.Score);
        clientPlayer.lastProcessedInputId = serverPlayer.LastProcessedInputId
    };

    function updateBallState(serverBall) {
        pongR.game.ball.position.x = convertToPixels(serverBall.Position.X);
        pongR.game.ball.position.y = convertToPixels(serverBall.Position.Y);
        pongR.game.ball.direction = serverBall.Direction;
        pongR.game.ball.angle = serverBall.Angle;
    };

    function ResetPositionsToInitialState(serverGame) {
        pongR.game.player1.inputs = [];
        pongR.game.player2.inputs = [];
        pongR.game.player1.resetPositionAndDirection(pongR.settings.viewport.width);
        pongR.game.player2.resetPositionAndDirection(pongR.settings.viewport.width);
        pongR.game.ball.resetPositionDirectionAndAngle(pongR.settings.viewport.width, pongR.settings.viewport.height,
                                                            serverGame.Ball.Direction, serverGame.Ball.Angle);
    }

    function convertToPixels(position) {
        // At the moment we are communicating using directly pixel values, so we just return the value
        return position;
    };

    function convertPositionToPixels(position) {
        // At the moment we are communicating using directly pixel values, so we just return the value
        // Both X and Y at the same time
        return position;
    };

    //calculateNewAngleAfterPlayerHit(player : Player, newBallDirection : string) : number
    //Calculates new angle after a ball collision with a player
    function calculateNewAngleAfterPlayerHit(player, newBallDirection) {
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
    function calculateNewAngleAfterFieldHit(oldAngle, ballDirection) {
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
    function checkCollisionWithPlayer(player, ball) {
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
    function checkCollisionWithFieldDelimiters(ball, fieldWidth, fieldHeight) {
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
    function updateBallPosition(angle, position, deltaTime, ballFixedStep) {
        var newPosition = { x: position.x, y: position.y };
        var step = Math.round(ballFixedStep * deltaTime);
        switch (angle) {
            case 0:
                newPosition.x = position.x + step;
                break;
            case 45:
                newPosition.x = position.x + step;
                newPosition.y = position.y - step;
                break;
            case 135:
                newPosition.x = position.x - step;
                newPosition.y = position.y - step;
                break;
            case 180:
                newPosition.x = position.x - step;
                break;
            case 225:
                newPosition.x = position.x - step;
                newPosition.y = position.y + step;
                break;
            case 315:
                newPosition.x = position.x + step;
                newPosition.y = position.y + step;
                break;
            default:
                if (pongR.game.ball.angle !== undefined) {
                    console.log("Unknown angle value " + pongR.game.ball.angle.toString());
                }
                return undefined;
        }
        return newPosition;
    };

    //process_input(player : Player) : number 
    //Computes the increment on the Y axis, given a player list of inputs
    function process_input(player, barScrollUnit, deltaTime) {
        //It's possible to have received multiple inputs by now, so we process each one        
        // Each input is an object structured like:
        // commands: list of commands (i.e. a list of "up"/"down")
        // sequenceNumber: the sequence number for this batch of inputs
        var y_dir = 0;
        var ic = player.inputs.length;
        var step = Math.round(barScrollUnit * deltaTime); 
        if (ic) {
            for (var j = 0; j < ic; ++j) {
                //don't process ones we already have simulated locally
                if (player.inputs[j].sequenceNumber <= player.lastProcessedInputId) continue;

                var input = player.inputs[j].commands;
                var c = input.length;
                for (var i = 0; i < c; ++i) {
                    var key = input[i];
                    if (key == 'up') {
                        y_dir -= step;
                        player.barDirection = "up";
                    }
                    else if (key == 'down') {
                        y_dir += step;
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
    function updateSelfPosition(topLeftVertex, yIncrement, fieldHeight, gap, barHeight) {
        var newTopLeftVertex = { x: topLeftVertex.x, y: topLeftVertex.y };
        if ((topLeftVertex.y + yIncrement >= gap) && (topLeftVertex.y + yIncrement + barHeight <= fieldHeight - gap)) {
            newTopLeftVertex.y += yIncrement;
        }
        else if (topLeftVertex.y + yIncrement < gap) {
            newTopLeftVertex.y = gap;
        }
        else {
            newTopLeftVertex.y = fieldHeight - (gap + barHeight);
        }
        return newTopLeftVertex;
    };

    // PRIVATE
    // Draws a frame of the game: the two players and the ball
    function drawScene() {
        drawField();
        drawPlayer(pongR.game.player1);
        drawPlayer(pongR.game.player2);
        drawBall();
    };

    function drawField() {
        //Set the color for this player
        pongR.canvasContext.fillStyle = "#111111"; // Almost Black
        //Draw a rectangle for us
        pongR.canvasContext.fillRect(0, 0, pongR.settings.viewport.width, pongR.settings.viewport.height);
    };

    function drawBall() {
        //Set the color for this player
        pongR.canvasContext.fillStyle = "#EE0000"; // Red
        //Draw a circle for us
        pongR.canvasContext.beginPath();
        pongR.canvasContext.arc(pongR.game.ball.position.x, pongR.game.ball.position.y, pongR.game.ball.radius, 0, 2 * Math.PI);
        pongR.canvasContext.fill();
    };

    function drawPlayer(player) {
        //Set the color for this player
        pongR.canvasContext.fillStyle = "#00FF00"; // Light Green
        //Draw a rectangle for us
        pongR.canvasContext.fillRect(player.topLeftVertex.x, player.topLeftVertex.y, player.barWidth, player.barHeight);
    };

    function performCountdown(counter, callback) {
        if (counter > 0) {
            drawText(counter);
            setTimeout(function () { performCountdown(--counter, callback) }, 1000);
        }
        else { // Countdown expired. If we have a callback, invoke it
            keyboard.reset(); // during the countdown the user may have pressed some keys
            pongR.me.inputs = [];
            if (callback) {
                callback();
            }
        }
    };

    function drawText(counter) {
        var display = "Game starts in " + counter;
        pongR.canvasContext.clearRect(400, 260, pongR.canvasContext.measureText(display).width, 20);
        pongR.canvasContext.fillStyle = "#111111"; // Almost Black
        pongR.canvasContext.fillRect(400, 260, pongR.canvasContext.measureText(display).width, 20);

        pongR.canvasContext.font = '20px "Helvetica"';
        pongR.canvasContext.fillStyle = "#EE0000"; // Red        

        pongR.canvasContext.fillText(display, 400, 280);

    };

    // This takes input from the client and keeps a record. 
    // It also sends the input information to the server immediately
    // as it is pressed. It also tags each input with a sequence number.
    function handleClientInputs(player) {

        var input = [];
        pongR.client_has_input = false; // TODO check why this variable is public
        var playerInput = null;

        var count = keyboard.pressed('up');
        for (var i = 0; i < count; i++) {
            input.push('up');
        } // up

        count = keyboard.pressed('down');
        for (var i = 0; i < count; i++) {
            input.push('down');
        } // down

        if (input.length) {

            //Update what sequence we are on now
            pongR.settings.input_sequence += 1;

            //Store the input state as a snapshot of what happened.
            playerInput = {
                sequenceNumber: pongR.settings.input_sequence,
                commands: input
            };

            pongR.me.inputs.push(playerInput);
        }

        return playerInput;
    };

    // as taken from https://github.com/FuzzYspo0N/realtime-multiplayer-in-html5/blob/master/game.core.js 
    function interpolateClientMovements(player) {
        //No updates...
        if (!pongR.serverUpdates.length) {
            return;
        }

        //First : Find the position in the updates, on the timeline
        //We call this current_time, then we find the past_pos and the target_pos using this,
        //searching throught the server_updates array for current_time in between 2 other times.
        // Then :  other player position = lerp ( past_pos, target_pos, current_time );

        //Find the position in the timeline of updates we stored.
        var current_time = pongR.client_time;
        var count = pongR.serverUpdates.length - 1;
        var target = null;
        var previous = null;

        var temp = new Date(); // used to parse the date stored in the updates as a UTC date in milliseconds        

        //We look from the 'oldest' updates, since the newest ones
        //are at the end (list.length-1 for example). This will be expensive
        //only when our time is not found on the timeline, since it will run all
        //samples. Usually this iterates very little before breaking out with a target.
        for (var i = 0; i < count; ++i) {

            var point = pongR.serverUpdates[i];
            var next_point = pongR.serverUpdates[i + 1];

            //Compare our point in time with the server times we have
            if (current_time > temp.getUTCTime(point.Timestamp) && current_time < temp.getUTCTime(next_point.Timestamp)) {
                target = next_point;
                previous = point;
                break;
            }
        }

        //With no target we store the last known
        //server position and move to that instead
        if (!target) {
            target = pongR.serverUpdates[0];
            previous = pongR.serverUpdates[0];
        }

        //Now that we have a target and a previous destination,
        //We can interpolate between then based on 'how far in between' we are.
        //This is simple percentage maths, value/target = [0,1] range of numbers.
        //lerp requires the 0,1 value to lerp to? thats the one.

        if (target && previous) {

            var target_time = temp.getUTCTime(target.Timestamp);

            var difference = target_time - current_time;
            var max_difference = Math.round(temp.getUTCTime(target.Timestamp) - temp.getUTCTime(previous.Timestamp));
            var time_point = (difference / max_difference);

            //Because we use the same target and previous in extreme cases
            //It is possible to get incorrect values due to division by 0 difference
            //and such. This is a safe guard and should probably not be here. lol.
            if (isNaN(time_point)) time_point = 0;
            if (time_point == -Infinity) time_point = 0;
            if (time_point == Infinity) time_point = 0;

            //The most recent server update
            var latest_server_data = pongR.serverUpdates[pongR.serverUpdates.length - 1];

            //The other players positions in this timeline, behind us and in front of us
            var otherTarget = pongR.other.playerNumber === 1 ? target.Game.Player1 : target.Game.Player2;
            var other_target_pos = convertPositionToPixels(otherTarget.TopLeftVertex);
            var otherPast = pongR.other.playerNumber === 1 ? previous.Game.Player1 : previous.Game.Player2;
            var other_past_pos = convertPositionToPixels(otherPast.TopLeftVertex);

            player.topLeftVertex = v_lerp(other_past_pos, other_target_pos, time_point);
            player.barDirection = otherTarget.BarDirection;
            player.score(otherTarget.Score);
            player.lastProcessedInputId = otherTarget.LastProcessedInputId
        }
    }

    function lerp(p, n, t) {
        var _t = Number(t);
        _t = (Math.max(0, Math.min(1, _t)));
        return Math.round(p + _t * (n - p));
    };

    function v_lerp(v, tv, t) {
        return {
            x: lerp(v.X, tv.X, t),
            y: lerp(v.Y, tv.Y, t)
        };
    };

    // A single step of the client update loop (a frame)
    function updateLoopStep() {
        // Step 1: Clear canvas
        pongR.canvasContext.clearRect(0, 0, pongR.settings.viewport.width, pongR.settings.viewport.height);
        // Step 2: Handle user inputs (update internal model)
        var playerInput = handleClientInputs(pongR.me);
        if (playerInput !== null) {
            // Step 3: Send the just processed input batch to the server.
            sendInput(pongR.game.gameId, pongR.me.user.connectionId, playerInput);
        }

        if (!pongR.settings.naive_approach) {
            interpolateClientMovements(pongR.other);
        }

        // Step 3: Draw the new frame in the canvas
        drawScene();
    };

    // Starts the client update loop 
    function startUpdateLoop() {
        if (pongR.goalTimestamp) {
            var now = new Date().getTime();
            var timelapse = (now - pongR.goalTimestamp) / 1000; // in seconds
            if (timelapse > pongR.settings.PAUSE_AFTER_GOAL) { // TODO Change here to adjust with network latency
                pongR.goalTimestamp = undefined;
                updateLoopStep();
            }
        }
        else {
            updateLoopStep();
        }

        // From MDN https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame  
        // Your callback routine must itself call requestAnimationFrame() unless you want the animation to stop.
        // We use requestAnimationFrame so that the the image is redrawn as many times as possible per second
        startAnimation(startUpdateLoop, pongR.canvas);
    };

    // PRIVATE - At each step of the game, checks for any collision, and updates the app internal state
    function checkForCollisionsAndUpdateBallState() {
        var collision = false;
        var newAngle = -1;
        // if collision with players' bar or field, update ball state (set next angle, next direction etc...)
        collision = checkCollisionWithPlayer(pongR.game.player1, pongR.game.ball);
        if (collision) {
            pongR.game.ball.direction = "right";
            pongR.game.ball.angle = calculateNewAngleAfterPlayerHit(pongR.game.player1, pongR.game.ball.direction);
        }
        else {
            collision = checkCollisionWithPlayer(pongR.game.player2, pongR.game.ball);
            if (collision) {
                pongR.game.ball.direction = "left";
                pongR.game.ball.angle = calculateNewAngleAfterPlayerHit(pongR.game.player2, pongR.game.ball.direction);
            }
            // No collision with players, let's check if we have a collision with the field delimiters
            else {
                collision = checkCollisionWithFieldDelimiters(pongR.game.ball, pongR.settings.viewport.width, pongR.settings.viewport.height);
                if (collision) {
                    pongR.game.ball.angle = calculateNewAngleAfterFieldHit(pongR.game.ball.angle, pongR.game.ball.direction);
                }
            }
        }
    };

    function computeNewClientPosition() {
        var yIncrement = process_input(pongR.me, pongR.settings.BAR_SCROLL_UNIT, pongR.deltaTime);
        return updateSelfPosition(pongR.me.topLeftVertex, yIncrement, pongR.settings.viewport.height, pongR.settings.gap, pongR.me.barHeight);
    }

    function updatePhysics() {
        // 1: updates self position and direction        
        if (!pongR.updateTimestamp) { // The first time this loop runs, pongR.updateTimestamp will be undefined
            pongR.updateTimestamp = new Date().getTime();
        }
        else {
            var now = new Date().getTime();
            pongR.deltaTime = (now - pongR.updateTimestamp) / 1000;
            //console.log("Delta time: " + pongR.deltaTime + ". Now: " + now + ", previous update: " + pongR.updateTimestamp);
            pongR.updateTimestamp = now;
        }

        pongR.me.topLeftVertex = computeNewClientPosition();

        // 2: update ball position
        var newPosition = updateBallPosition(pongR.game.ball.angle, pongR.game.ball.position, pongR.deltaTime, pongR.settings.BALL_FIXED_STEP);
        pongR.game.ball.position = newPosition;
        // 2: check collision
        checkForCollisionsAndUpdateBallState();
    };

    // Initial setup of the match state and start of the game interval
    function initMatch(opts) {
        pongR.game = new Game(opts.PlayRoomId, opts.Player1, opts.Player2, opts.BallDirection);

        // Set the canvas dimensions
        pongR.canvas = document.getElementById("viewport");
        pongR.canvas.width = pongR.settings.viewport.width;
        pongR.canvas.height = pongR.settings.viewport.height;

        // Get the 2d context to draw on the canvas
        // getContext() returns an object that provides methods and properties for drawing on the canvas.
        pongR.canvasContext = pongR.canvas.getContext("2d");

        pongR.me = pongR.pongRHub.username === pongR.game.player1.user.username() ? pongR.game.player1 : pongR.game.player2;
        pongR.other = pongR.me.user.username() === pongR.game.player1.user.username() ? pongR.game.player2 : pongR.game.player1;

        ko.applyBindings(pongR.game);
                
        // Initialise keyboard handler
        keyboard = new THREEx.KeyboardState();

        //A list of recent server updates
        pongR.serverUpdates = [];

        // Draw initial scene
        drawScene();

        pongR.deltaTime = 0.015; // default at 66 fps
    };

    // SignalR functions

    function opponentLeft() {
        alert("Opponent left. Going back to wait list");
        clearAnimation();
        clearPhysicsLoop();
        keyboard.destroy();
        pongR.game.player1.user.username("Player #1");
        pongR.game.player1.score("0");
        pongR.game.player2.user.username("Player #2");
        pongR.game.player2.score("0");
        pongR.game.destroy();
    };

    function wait() {
        $("#waiter").css("visibility", "visible");
    };

    function setupMatch(opts) {
        $("#waiter").remove();
        initMatch(opts);
        performCountdown(3, startGame);
    };

    // Receives an updated game state from the server. Being the server authoritative, means that we have to apply this state to our current state
    function updateGame(updatePacket) {
        var goal = false;
        if (pongR.game.player1.score() < updatePacket.Game.Player1.Score) {
            goal = true;
        }
        else if (pongR.game.player2.score() < updatePacket.Game.Player2.Score) {
            goal = true;
        }

        var remoteMe = pongR.me.playerNumber === 1 ? updatePacket.Game.Player1 : updatePacket.Game.Player2;
        var remoteOther = pongR.me.playerNumber === 2 ? updatePacket.Game.Player1 : updatePacket.Game.Player2;

        if (goal) {
            pongR.goalTimestamp = new Date().getTime();
            // Only update my last processed input id
            pongR.me.lastProcessedInputId = remoteMe.LastProcessedInputId
            // We also clear history of inputs as we start afresh            
            pongR.game.player1.score(updatePacket.Game.Player1.Score);
            pongR.game.player2.score(updatePacket.Game.Player2.Score);
            // Then reset positions
            ResetPositionsToInitialState(updatePacket.Game);
            // Reset keyboard buffer
            keyboard.reset();
            performCountdown(3);
        }
        else {
            // Me
            updatePlayerState(pongR.me, remoteMe);
            // Let's apply client prediction: let's replay all input commands not yet ack'd by the server and check if we have collisions
            pongR.me.topLeftVertex = computeNewClientPosition();
            checkForCollisionsAndUpdateBallState();

            if (pongR.settings.naive_approach) {
                // Other - we have to update the score and the latest input id processed! 			
                updatePlayerState(pongR.other, remoteOther);
            }
            else {
                pongR.other.score(remoteOther.Score);
                pongR.other.lastProcessedInputId = remoteOther.LastProcessedInputId;
                pongR.other.barDirection = remoteOther.BarDirection;
            }

            pongR.serverUpdates.push(updatePacket);
            var tempDate = new Date();
            pongR.server_time = tempDate.getUTCTime(updatePacket.Timestamp);
            pongR.client_time = pongR.server_time - pongR.settings.net_offset;

            //we limit the buffer in seconds worth of updates
            //update loop rate * buffer seconds = number of samples
            if (pongR.serverUpdates.length >= (66 * pongR.settings.updates_buffer_size)) {
                pongR.serverUpdates.splice(0, 1); // remove the oldest item
            }

            // Ball
            updateBallState(updatePacket.Game.Ball);
        }
    };

    function startGame() {
        startPhysicsLoop();
        startUpdateLoop();
    }

    // sendInput(gameId : number, connectionId : string, input : PlayerInput) : void
    function sendInput(gameId, connectionId, input) {
        pongR.pongRHub.queueInput(gameId, connectionId, input);
    }

    // Public methods
    pongR.PublicPrototype.createInstance = function (width, height, username) {
        pongR.settings = new Settings(width, height);
        pongR.pongRHub = $.connection.pongRHub;
        pongR.pongRHub.username = username;
        pongR.pongRHub.opponentLeft = opponentLeft;
        pongR.pongRHub.wait = wait;
        pongR.pongRHub.setupMatch = setupMatch;
        pongR.pongRHub.updateGame = updateGame;
    }

    pongR.PublicPrototype.connect = function () {
        $.connection.hub.start()
                    .done(function () {
                        pongR.pongRHub.joined();
                    });
    };

    pongR.PublicPrototype.UnitTestPrototype.calculateNewAngleAfterPlayerHit = calculateNewAngleAfterPlayerHit;
    pongR.PublicPrototype.UnitTestPrototype.calculateNewAngleAfterFieldHit = calculateNewAngleAfterFieldHit;
    pongR.PublicPrototype.UnitTestPrototype.checkCollisionWithPlayer = checkCollisionWithPlayer;
    pongR.PublicPrototype.UnitTestPrototype.checkCollisionWithFieldDelimiters = checkCollisionWithFieldDelimiters;
    pongR.PublicPrototype.UnitTestPrototype.updateBallPosition = updateBallPosition;
    pongR.PublicPrototype.UnitTestPrototype.process_input = process_input;
    pongR.PublicPrototype.UnitTestPrototype.updateSelfPosition = updateSelfPosition;
    pongR.PublicPrototype.UnitTestPrototype.updateGame = updateGame;

    return pongR.PublicPrototype;
} (jQuery, ko));