/*
* Author: Valerio Gheri
* Date: 8/10/2012
* Description: PongR game logic definition with the Module Augmentation pattern
*/

var PongR = (function (PongR, $, ko) {
    var self = this;
    var me;
    var keyboard;
    var requestAnimationFrameRequestId;
    var physicsLoopId;

    PongR.prototype.startAnimation = function () {
        requestAnimationFrameRequestId = window.requestAnimationFrame(self.startUpdateLoop);
    };

    PongR.prototype.clearAnimation = function () {
        window.cancelAnimationFrame(requestAnimationFrameRequestId);
    };

    PongR.prototype.startPhysicsLoop = function () {
        physicsLoopId = window.setInterval(self.updatePhysics, 15);
    };

    PongR.prototype.clearPhysicsLoop = function () {
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
                    }
                    else if (key == 'down') {
                        y_dir += this.settings.BAR_SCROLL_UNIT;
                    }

                } //for all input values

            } //for each input command
        } //if we have inputs

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

    return PongR;
} (PongR, jQuery, ko));