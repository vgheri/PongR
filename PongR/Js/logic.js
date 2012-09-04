/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR game logic
*/

var pongR = (function (myPongR, $, ko) {

    var myOldMarginTop;

    function getElementTopLeftVertex(element) {
        var x, y;
        x = element.offsetLeft;
        y = element.offsetTop;
        return new myPongR.Point(x, y);
    };

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

    // Calculates new angle after a ball collision with a player
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
    }

    function checkForCollisionsAndUpdateBallState() {
        // check for collision
        // if collision with players' bar or field, update ball state (set next angle, next direction etc...)
        var barCollision = checkCollisionWithPlayer();
        // No collision with player's bar, let's check if we have a collision with the field delimiters or if we have a goal condition
        if (!barCollision) {

        }
    };

    // TODO: add functions that will perform hit-checks with the walls or the bars, goal-check and ball movements
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

    // Process a step of the game
    myPongR.processState = function () {
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
        pongRHub.notifyPosition(app.playRoomId, ko.toJSON(me));
    };

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