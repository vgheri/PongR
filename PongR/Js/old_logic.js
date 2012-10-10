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