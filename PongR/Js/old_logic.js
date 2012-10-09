/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR game logic definition with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $, ko) {

    var myOldMarginTop;
    var keyboard;
    
    //PRIVATE -
    function hideGoalMessage() {
        $("#messageContainer").text("");
        $("#messageContainer").css("visibility", "hidden");
    }

    // PRIVATE - Updates the score in the internal state of the app. Any change will be automatically reflected in the UI thanks to Knockout
    function updateScore(playerNameWhoScored) {
        var oldScore;
        if (app.player1.user.username() === playerNameWhoScored) {
            oldScore = app.player1.score();
            app.player1.score(oldScore + 1);
        }
        else {
            oldScore = app.player2.score();
            app.player2.score(oldScore + 1);
        }
    }

    // To be modified
    // 1: Clean timer and keyboard event handler    
    // 2: the player who scored send a message to the server to notify the new score. The server replies with the new ball direction to both players
    function restartGameAfterGoal() {
        var playerName = getNameOfPlayerWhoScored();
        // step 0
        //myPongR.clearAnimation(requestAnimationFrameRequestId);
        //myPongR.removeKeyboardEventListener();
        //myPongR.clearPositionNotificationInterval(serverNotificationIntervalId);
        // step 1 
        //displayGoalMessage(playerName);
        //updateScore(playerName);
        // step 2
        //resetAllPositionsToInitialState();
        // step 3
        if (me.user.username() === playerName) {
            notifyServerOnGoal(playerName);
        }
    }

    // PRIVATE - At each step of the game, checks for any collision, and updates the app internal state
    function checkForCollisionsAndUpdateBallState() {
        var collision = false;
        var newAngle = -1;
        // if collision with players' bar or field, update ball state (set next angle, next direction etc...)
        var collisionInfo = checkCollisionWithPlayers();
        if (collisionInfo.collision) {
            collision = true;
            app.ball.direction = collisionInfo.newBallDirection;
            app.ball.angle = myPongR.calculateNewAngleAfterPlayerHit(collisionInfo.hitPlayer === 1 ? app.player1 : app.player2, collisionInfo.newBallDirection);
        }
        // No collision with player's bar, let's check if we have a collision with the field delimiters or if we have a goal condition
        else {
            collision = checkCollisionWithFieldDelimiters();
            if (collision) {
                app.ball.angle = myPongR.calculateNewAngleAfterFieldHit(app.ball.angle, app.ball.direction);
            }
        }
    };

    // Initial setup of the match state and start of the game interval
    myPongR.setupMatch = function (opts) {
        // Proposal: app is now a global var... make it private
        app = new pongR.App(opts.PlayRoomId, opts.Player1, opts.Player2, opts.BallDirection);

        // Proposal: I can extract the following blocks of code into a function to retrieve the current canvas context
        // Set the canvas dimensions
        myPongR.viewPort = document.getElementById("viewport");
        myPongR.viewPort.width = app.fieldWidth;
        myPongR.viewPort.height = app.fieldHeight;

        // Get the 2d context to draw on the canvas
        // getContext() returns an object that provides methods and properties for drawing on the canvas.
        myPongR.canvasContext = myPongR.viewPort.getContext("2d");
        myPongR.canvasContext.font = '11px "Helvetica"';

        if (opts.Player1.Username === pongRHub.username) {
            me = app.player1;
        }
        else {
            me = app.player2;
        }

        ko.applyBindings(app);

        // Start the physics loop
        startPhysicsLoop();

        // Initialise keyboard handler
        keyboard = new THREEx.KeyboardState();

        //A list of recent server updates
        myPongR.serverUpdates = [];

        // Start the update loop
        startUpdateLoop();
    };

    // PRIVATE
    // Starts the client update loop 
    function startUpdateLoop() {
        updateLoopStep();

        // From MDN https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame  
        // Your callback routine must itself call requestAnimationFrame() unless you want the animation to stop.
        // We use requestAnimationFrame so that the the image is redrawn as many times as possible per second
        requestAnimationFrameRequestId = myPongR.startAnimation(startUpdateLoop);
    };

    // PRIVATE
    // A single step of the client update loop (a frame)
    function updateLoopStep() {
        // Step 1: Clear canvas
        myPongR.canvasContext.clearRect(0, 0, myPongR.viewPort.width, myPongR.viewPort.height);
        // Step 2: Handle user inputs (update internal model)
        var playerInput = handleClientInputs(me);
        if (playerInput !== null) {
            // Step 3: Send the just processed input batch to the server.
            pongRHub.queueInput(app.gameId, me.user.connectionId, playerInput);
        }
        // Step 3: Draw the new frame in the canvas
        draw(app, myPongR.canvasContext);
    };

    // PRIVATE
    // Draws a frame of the game: the two players and the ball
    function draw(app, canvasContext) {
        drawField(app, canvasContext);
        drawPlayer(app.player1, canvasContext);
        drawPlayer(app.player2, canvasContext);
        drawBall(app.ball, canvasContext);
    };

    function drawField(app, canvasContext) {
        //Set the color for this player
        canvasContext.fillStyle = "#111111"; // Almost Black
        //Draw a rectangle for us
        canvasContext.fillRect(0, 0, app.fieldWidth, app.fieldHeight);
    };

    function drawBall(ball, canvasContext) {
        //Set the color for this player
        canvasContext.fillStyle = "#EE0000"; // Red
        //Draw a circle for us
        canvasContext.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI);
    };

    function drawPlayer(player, canvasContext) {
        //Set the color for this player
        canvasContext.fillStyle = "#00FF00"; // Light Green
        //Draw a rectangle for us
        canvasContext.fillRect(player.topLeftVertex.x, player.topLeftVertex.y, player.barWidth, player.barHeight);
    };

    // PRIVATE
    // This takes input from the client and keeps a record. 
    // It also sends the input information to the server immediately
    // as it is pressed. It also tags each input with a sequence number.
    function handleClientInputs(player) {

        var input = [];
        this.client_has_input = false;
        var playerInput = null;

        if (keyboard.pressed('up')) {
            input.push('up');
        } // up

        if (keyboard.pressed('down')) {
            input.push('down');
        } // down

        if (input.length) {

            //Update what sequence we are on now
            app.settings.input_sequence += 1;

            //Store the input state as a snapshot of what happened.
            playerInput = {
                sequenceNumber: this.input_seq,
                commands: input
            };

            me.inputs.push(playerInput);
        }

        return playerInput;
    };

    function updatePhysics() {
        // 1: updates self position and direction
        var yIncrement = process_input(me);
        updateSelfPosition(me, yIncrement, app.fieldHeight, app.settings.gap);
        // 2: update ball position
        var newPosition = updateBallPosition(app.ball.angle, app.ball.position);
        app.ball.position = newPosition;
        // 2: check collision
        checkForCollisionsAndUpdateBallState();
    };

    

    

    

    myPongR.resetObjectsPositionToInitialState = function () {
        resetAllPositionsToInitialState();
    };

    // TODO: To be modified
    // PRIVATE - Reset players and ball position to initial state 
    function resetAllPositionsToInitialState() {
        app.player1.barMarginTop(37);
        app.player2.barMarginTop(37);
        $("#player1-bar").css("top", "37%");
        $("#player2-bar").css("top", "37%");
        ball.style.left = "49%";
        ball.style.top = "54%";
        var element = $("#ball")[0];
        var tempPoint = getElementTopLeftVertex(element);
        app.ball.position.x = tempPoint.x - app.ball.radius;
        app.ball.position.y = tempPoint.y - app.ball.radius;
        app.player1.topLeftVertex = getElementTopLeftVertex($("#player1-bar")[0]);
        app.player2.topLeftVertex = getElementTopLeftVertex($("#player2-bar")[0]);
        myOldMarginTop = ko.utils.unwrapObservable(me.barMarginTop);
    }

    // PUBLIC
    myPongR.displayGoalMessage = function (playerName) {
        $("#messageContainer").text("Goal for " + playerName + "!");
        $("#messageContainer").css("visibility", "visible");
        window.setTimeout(hideGoalMessage, 1000);
    };

    // PUBLIC - Updates the score in the internal state of the app. Any change will be automatically reflected in the UI thanks to Knockout
    myPongR.updateScore = function (playerNameWhoScored) {
        var oldScore;
        if (app.player1.user.username() === playerNameWhoScored) {
            oldScore = app.player1.score();
            app.player1.score(oldScore + 1);
        }
        else {
            oldScore = app.player2.score();
            app.player2.score(oldScore + 1);
        }
    }

    return myPongR;
} (pongR, jQuery, ko));