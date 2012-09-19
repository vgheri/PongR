/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR game logic definition with the Module Augmentation pattern
*/

var pongR = (function (myPongR, $, ko) {

    var myOldMarginTop;


    /*
       Animation support functions and keyboard event handlers
    */
    myPongR.startAnimation = function (animationFunction) {
        return window.requestAnimationFrame(animationFunction);
    };

    myPongR.clearAnimation = function (requestId) {
        window.cancelAnimationFrame(requestId);
    };

    myPongR.removeKeyboardEventListener = function () {
        document.removeEventListener("keydown", pongR.animateMyBar, false);
    };

    myPongR.setKeyboardEventListener = function () {
        document.addEventListener("keydown", pongR.animateMyBar, false);
    };

    // PRIVATE - Get the top left vertex of a DOM element
    function getElementTopLeftVertex(element) {
        var x, y;
        x = element.offsetLeft;
        y = element.offsetTop;
        return new myPongR.Point(x, y);
    };

    // PRIVATE - Updates the position of the ball based on its direction and its angle
    function updateBallPosition() {
        switch (app.ball.angle) {
            case 0:
                app.ball.coordinates.x += app.ball.fixedStep;
                break;
            case 45:
                app.ball.coordinates.x += app.ball.fixedStep;
                app.ball.coordinates.y -= app.ball.fixedStep;
                break;
            case 135:
                app.ball.coordinates.x -= app.ball.fixedStep;
                app.ball.coordinates.y -= app.ball.fixedStep;
                break;
            case 180:
                app.ball.coordinates.x -= app.ball.fixedStep;
                break;
            case 225:
                app.ball.coordinates.x -= app.ball.fixedStep;
                app.ball.coordinates.y += app.ball.fixedStep;
                break;
            case 315:
                app.ball.coordinates.x += app.ball.fixedStep;
                app.ball.coordinates.y += app.ball.fixedStep;
                break;
            default:
                alert("Unknown angle!");
                console.log("Unknown angle value " + app.ball.angle.toString());
                throw ("Unknown angle value");
                break;
        }
        var centreX = app.ball.coordinates.x - app.ball.radius;
        var centreY = app.ball.coordinates.y - app.ball.radius;
        ball.style.left = centreX.toString() + 'px';
        ball.style.top = centreY.toString() + 'px';
    };

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
    };

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
    };

    // TODO - PRIVATE - Rename the method to reflect the updates to the ball as well
    function checkCollisionWithPlayer() {
        var barCollision = false;
        var newBallDirection;
        var newAngle;
        if (app.player1.topLeftVertex.x + app.player1.barWidth >= app.ball.coordinates.x - app.ball.radius) {
            if ((app.player1.topLeftVertex.y <= app.ball.coordinates.y + app.ball.radius)
                && (app.player1.topLeftVertex.y + app.player1.barHeight >= app.ball.coordinates.y - app.ball.radius)) {
                barCollision = true;
                newBallDirection = "right";
                newAngle = calculateNewAngleAfterPlayerHit(app.player1, newBallDirection);
            }
        }
        else if (app.player2.topLeftVertex.x <= app.ball.coordinates.x + app.ball.radius) {
            if ((app.player2.topLeftVertex.y <= app.ball.coordinates.y + app.ball.radius)
                && (app.player2.topLeftVertex.y + app.player2.barHeight >= app.ball.coordinates.y - app.ball.radius)) {
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
    };

    // TODO - PRIVATE - Rename the method to reflect the updates to the ball as well
    function checkCollisionWithFieldDelimiters() {
        var fieldCollision = false;
        var newAngle;
        // Hit check. I check first for y axis because it's less frequent that the condition will be true, so most of the time 
        // we check only 1 if statement instead of 2 
        // We consider a hit when the ball is very close to the field delimiter (+/-5 px)
        if ((app.ball.coordinates.y >= app.fieldTopLeftVertex.y - 5 && app.ball.coordinates.y <= app.fieldTopLeftVertex.y + 5) ||
                (app.ball.coordinates.y >= app.fieldTopLeftVertex.y + app.fieldHeight - 5 && app.ball.coordinates.y <= app.fieldTopLeftVertex.y + app.fieldHeight + 5)) {
            if (app.ball.coordinates.x >= app.fieldTopLeftVertex.x && app.ball.coordinates.x <= app.fieldTopLeftVertex.x + app.fieldWidth) {

                fieldCollision = true;
                newAngle = calculateNewAngleAfterFieldHit(app.ball.angle, app.ball.direction);
            }
        }
        if (fieldCollision) {
            app.ball.angle = newAngle;
        }
        return fieldCollision;
    };

    // PRIVATE - Checks if one of the players scored
    function checkGoal() {
        var goal = false;
        if (app.ball.coordinates.x <= app.fieldTopLeftVertex.x || app.ball.coordinates.x >= app.fieldTopLeftVertex.x + app.fieldWidth) {
            goal = true;
        }
        return goal;
    };

    //PRIVATE - 
    function displayGoalMessage(playerName) {
        $("#messageContainer").text("Goal for " + playerName + "!");
        $("#messageContainer").css("visibility", "visible");
        window.setTimeout(hideGoalMessage, 1000);
    };

    //PRIVATE -
    function hideGoalMessage(playerName) {
        $("#messageContainer").text("");
        $("#messageContainer").css("visibility", "hidden");
    };

    //PRIVATE -
    function getNameOfPlayerWhoScored() {
        var playerGoal = "1"; // Player who scored
        if (app.ball.coordinates.x <= app.fieldTopLeftVertex.x) {
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
        app.ball.coordinates.x = tempPoint.x - app.ball.radius;
        app.ball.coordinates.y = tempPoint.y - app.ball.radius;
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
    function notifyServerOnGoal() {
        pongRHub.onGoal(ko.toJSON(app));
    };

    // 0: Clean timer and keyboard event handler
    // 1: display a message and update score
    // 2: reset players and ball position    
    // 3: the player who scored send a message to the server to notify the new score. The server replies with the new ball direction to both players
    function restartGameAfterGoal() {
        var playerName = getNameOfPlayerWhoScored();
        // step 0
        pongR.clearAnimation(processStateTimeout);
        pongR.removeKeyboardEventListener();
        // step 1 
        displayGoalMessage(playerName);
        updateScore(playerName);
        // step 2
        resetAllPositionsToInitialState();
        // step 3
        notifyServerOnGoal();
    };

    // PRIVATE - At each step of the game, checks for any collision or goal event, and updates the app internal state
    function checkForCollisionsAndUpdateBallState() {
        var goal = false;
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
    };

    // Initial setup of the match state and start of the game interval
    myPongR.setupMatch = function (opts) {
        app = new pongR.App(opts.PlayRoomId, opts.Player1, opts.Player2, opts.BallDirection);

        if (opts.Player1.Username === pongRHub.username) {
            me = app.player1;
        }
        else {
            me = app.player2;
        }

        myOldMarginTop = ko.utils.unwrapObservable(me.barMarginTop);
        ko.applyBindings(app);
    };

    // Processes a step of the game
    myPongR.processState = function () {
        // To test performance
        //var start = new Date().getTime();

        // From MDN https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame  
        // Your callback routine must itself call requestAnimationFrame() unless you want the animation to stop.
        processStateTimeout = pongR.startAnimation(pongR.processState);
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

        var end = new Date().getTime();
        /* for test
        if (removeMe < 1000) {
            var duration = end - start;
            console.log("processState duration: " + duration + " ms");
        }
        removeMe++;*/
        //TODO Refactor all the SignalR related code into a separate js file
        //I have to remove this statement from here because othwerise I will flood the server! 
        //pongRHub.notifyPosition(app.playRoomId, ko.toJSON(me));
    };

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

    return myPongR;
} (pongR, jQuery, ko));