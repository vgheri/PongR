/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR game logic definition with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $, ko) {

    var myOldMarginTop;
    var keyboard;

    /*
    Animation support functions and keyboard event handlers
    */
    myPongR.startAnimation = function (animationFunction) {
        //return window.requestAnimationFrame(animationFunction);
        return window.setTimeout(animationFunction, 17);
    };

    myPongR.clearAnimation = function (requestId) {
        //window.cancelAnimationFrame(requestId);
        window.clearTimeout(requestId);
    };

    myPongR.removeKeyboardEventListener = function () {
        document.removeEventListener("keydown", pongR.animateMyBar, false);
    };

    myPongR.setKeyboardEventListener = function () {
        document.addEventListener("keydown", pongR.animateMyBar, false);
    };

    myPongR.startPositionNotificationInterval = function () {
        return window.setInterval(pongRHub.notifyServerOfPlayerPosition, pongR.NOTIFICATION_FREQUENCY);
    };

    myPongR.clearPositionNotificationInterval = function (handle) {
        window.clearInterval(handle);
    };

    // PRIVATE - Starts the physics simulation loop. Will run every 15ms
    function startPhysicsLoop() {
        window.setInterval(updatePhysics, 15);
    };

    // PRIVATE - Get the top left vertex of a DOM element
    function getElementTopLeftVertex(element) {
        var x, y;
        x = element.offsetLeft;
        y = element.offsetTop;
        return new myPongR.Point(x, y);
    }

    

    // PRIVATE - Calculates new angle after a ball collision with a player
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
            alert("Unknown new angle value");
            console.log("Hit on player :" + player.playerNumber.toString() + ". New ball direction: " + newBallDirection + ". Player direction: " + player.barDirection);
            throw ("Unknown new angle value");
        }
        return angle;
    }

    // PRIVATE - Calculates new angle after a ball collision with a player
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
            alert("Unknown new angle value");
            console.log("Unknown new angle value upon hit on field delimiters. Ball direction: " + ballDirection + ". Ball old angle: " + oldAngle);
            throw ("Unknown new angle value");
        }
        return newAngle;
    }

    // TODO - PRIVATE - Rename the method to reflect the updates to the ball as well
    function checkCollisionWithPlayer() {
        var barCollision = false;
        var newBallDirection;
        var newAngle;
        if (app.player1.topLeftVertex.x + app.player1.barWidth >= app.ball.position.x - app.ball.radius) {
            if ((app.player1.topLeftVertex.y <= app.ball.position.y + app.ball.radius)
                && (app.player1.topLeftVertex.y + app.player1.barHeight >= app.ball.position.y - app.ball.radius)) {
                barCollision = true;
                newBallDirection = "right";
                newAngle = calculateNewAngleAfterPlayerHit(app.player1, newBallDirection);
            }
        }
        else if (app.player2.topLeftVertex.x <= app.ball.position.x + app.ball.radius) {
            if ((app.player2.topLeftVertex.y <= app.ball.position.y + app.ball.radius)
                && (app.player2.topLeftVertex.y + app.player2.barHeight >= app.ball.position.y - app.ball.radius)) {
                barCollision = true;
                newBallDirection = "left";
                newAngle = calculateNewAngleAfterPlayerHit(app.player2, newBallDirection);
            }
        }
        if (barCollision) {
            app.ball.angle = newAngle;
            app.ball.direction = newBallDirection;
        }
        return barCollision;
    }

    // TODO - PRIVATE - Rename the method to reflect the updates to the ball as well
    function checkCollisionWithFieldDelimiters() {
        var fieldCollision = false;
        var newAngle;
        // Hit check. I check first for y axis because it's less frequent that the condition will be true, so most of the time 
        // we check only 1 if statement instead of 2 
        // We consider a hit when the ball is very close to the field delimiter (+/-5 px)
        if ((app.ball.position.y >= app.fieldTopLeftVertex.y - 5 && app.ball.position.y <= app.fieldTopLeftVertex.y + 5) ||
                (app.ball.position.y >= app.fieldTopLeftVertex.y + app.fieldHeight - 5 && app.ball.position.y <= app.fieldTopLeftVertex.y + app.fieldHeight + 5)) {
            if (app.ball.position.x >= app.fieldTopLeftVertex.x && app.ball.position.x <= app.fieldTopLeftVertex.x + app.fieldWidth) {

                fieldCollision = true;
                newAngle = calculateNewAngleAfterFieldHit(app.ball.angle, app.ball.direction);
            }
        }
        if (fieldCollision) {
            app.ball.angle = newAngle;
        }
        return fieldCollision;
    }

    // PRIVATE - Checks if one of the players scored
    function checkGoal() {
        var goal = false;
        if (app.ball.position.x <= app.fieldTopLeftVertex.x || app.ball.position.x >= app.fieldTopLeftVertex.x + app.fieldWidth) {
            goal = true;
        }
        return goal;
    }

    //PRIVATE -
    function hideGoalMessage() {
        $("#messageContainer").text("");
        $("#messageContainer").css("visibility", "hidden");
    }

    //PRIVATE -
    function getNameOfPlayerWhoScored() {
        var playerGoal = "1"; // Player who scored
        if (app.ball.position.x <= app.fieldTopLeftVertex.x) {
            playerGoal = "2";
        }
        return app.player1.playerNumber.toString() === playerGoal ? app.player1.user.username() : app.player2.user.username();
    }

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

    // Notifies the server that the score is changed
    function notifyServerOnGoal(playerName) {
        pongRHub.onGoal(ko.toJSON(app), playerName);
    }

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

    // PRIVATE - At each step of the game, checks for any collision or goal event, and updates the app internal state
    function checkForCollisionsAndUpdateBallState() {
        // check for collision
        // if collision with players' bar or field, update ball state (set next angle, next direction etc...)
        var collision = checkCollisionWithPlayer();
        // No collision with player's bar, let's check if we have a collision with the field delimiters or if we have a goal condition
        if (!collision) {
            collision = checkCollisionWithFieldDelimiters();
            if (!collision) {
                if (checkGoal()) {
                    restartGameAfterGoal();
                }
            }
        }
    }

    // Initial setup of the match state and start of the game interval
    myPongR.setupMatch = function (opts) {
        app = new pongR.App(opts.PlayRoomId, opts.Player1, opts.Player2, opts.BallDirection);

        // Start the physics loop


        // Initialise keyboard handler
        keyboard = new THREEx.KeyboardState();



        if (opts.Player1.Username === pongRHub.username) {
            me = app.player1;
        }
        else {
            me = app.player2;
        }

        myOldMarginTop = ko.utils.unwrapObservable(me.barMarginTop);
        ko.applyBindings(app);
    };

    function updatePhysics() {
        // 1: updates self position and direction
        var yIncrement = process_input(me);
        me.topLeftVertex.y += yIncrement;
        // 2: update ball position
        var newPosition = updateBallPosition();
        app.ball.position = newPosition;
        // 2: check collision
        checkForCollisionsAndUpdateBallState();
    };

    // PRIVATE - Updates the position of the ball based on its direction and its angle
    function updateBallPosition(angle, position) {
        var newPosition = position;
        switch (angle) {
            case 0:
                newPosition = position.x + myPongR.BALL_FIXED_STEP;
                break;
            case 45:
                newPosition = position.x + myPongR.BALL_FIXED_STEP;
                newPosition = position.y - myPongR.BALL_FIXED_STEP;
                break;
            case 135:
                newPosition = position.x - myPongR.BALL_FIXED_STEP;
                newPosition = position.y - myPongR.BALL_FIXED_STEP;
                break;
            case 180:
                newPosition = position.x - myPongR.BALL_FIXED_STEP;
                break;
            case 225:
                newPosition = position.x - myPongR.BALL_FIXED_STEP;
                newPosition = position.y + myPongR.BALL_FIXED_STEP;
                break;
            case 315:
                newPosition = position.x + myPongR.BALL_FIXED_STEP;
                newPosition = position.y + myPongR.BALL_FIXED_STEP;
                break;
            default:
                alert("Unknown angle!");
                console.log("Unknown angle value " + app.ball.angle.toString());
                throw ("Unknown angle value");
        }
        return newPosition;
    }

    // PRIVATE - Computes the increment on the Y axis, given a player list of inputs
    function process_input(player) {
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
                    if (key == 'u') {
                        y_dir -= myPongR.BAR_SCROLL_UNIT;
                    }
                    else if (key == 'd') {
                        y_dir += myPongR.BAR_SCROLL_UNIT;
                    }

                } //for all input values

            } //for each input command
        } //if we have inputs

        if (player.inputs.length) {
            //we can now update the sequence number for the last batch of input processed 
            // and then clear the array since these have been processed            
            player.lastProcessedInputId = player.inputs[ic - 1].seq;
            player.inputs.splice(0, ic);
        }

        //give it back
        return y_dir;
    };

    // TO BE DELETED!
    // Processes a step of the game
    myPongR.processState = function () {
        // To test performance
        //var start = new Date().getTime();

        // 0: check if the bar has moved since last step, otherwise set its direction to "";
        // 1: update ball position
        // 2: check for collision
        //    2a: update ball state (set next angle, next direction etc...)
        // 3: check for goal condition
        //    3a: update score
        //    3b: bring the players' bar and the ball to initial position                   
        // Step 0
        if (myOldMarginTop === me.barMarginTop()) {
            me.barDirection = "";
        }

        // Step 1
        updateBallPosition();
        checkForCollisionsAndUpdateBallState();

        //var end = new Date().getTime();
        /* for test
        if (removeMe < 1000) {
        var duration = end - start;
        console.log("processState duration: " + duration + " ms");
        }
        removeMe++;*/
        // From MDN https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame  
        // Your callback routine must itself call requestAnimationFrame() unless you want the animation to stop.
        requestAnimationFrameRequestId = myPongR.startAnimation(pongR.processState);
    };

    // TO BE DELETED!
    // Moves the player's bar accordingly to the keystroke pressed (up or down) and updates the javascript state
    myPongR.animateMyBar = function (e) {
        var keyCode = e.keyCode;
        myOldMarginTop = ko.utils.unwrapObservable(me.barMarginTop);
        var newMarginTop = me.barMarginTop();
        // Down Arrow
        if (keyCode === 40) {
            if (me.barMarginTop() + myPongR.BAR_SCROLL_UNIT <= 70) {  // 100 - 25 (bar height) - 5 (mininum distance from border)
                newMarginTop += myPongR.BAR_SCROLL_UNIT;
                me.barDirection = "down";
            }
        }
        // Up Arrow
        else if (keyCode === 38) {
            if (me.barMarginTop() - myPongR.BAR_SCROLL_UNIT >= 5) {  // 0 + 5 (minimum distance from border)
                newMarginTop -= myPongR.BAR_SCROLL_UNIT;
                me.barDirection = "up";
            }
        }
        me.barMarginTop(newMarginTop);
        // TODO: Re-engineer this code, maybe using a closure on Player to get its latest coordinates
        var element;
        if (me.playerNumber === 1) {
            element = $("#player1-bar")[0];
        }
        else {
            element = $("#player2-bar")[0];
        }
        me.topLeftVertex = getElementTopLeftVertex(element);
    };

    myPongR.resetObjectsPositionToInitialState = function () {
        resetAllPositionsToInitialState();
    };

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