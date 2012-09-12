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
    };

    // Calculates new angle after a ball collision with a player
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

    // TODO Rename the method to reflect the updates to the ball as well
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

    // TODO Rename the method to reflect the updates to the ball as well
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
    }

    function checkForCollisionsAndUpdateBallState() {
        var goal = false;
        // check for collision
        // if collision with players' bar or field, update ball state (set next angle, next direction etc...)
        var collision = checkCollisionWithPlayer();
        // No collision with player's bar, let's check if we have a collision with the field delimiters or if we have a goal condition
        if (!collision) {
            collision = checkCollisionWithFieldDelimiters(); // TODO Implement method
            if (!collision) {
                //goal = checkGoal(); // TODO Implement method
            }
        }
    };

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

        //TODO Refactor all the SignalR related code into a separate js file
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