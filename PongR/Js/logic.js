/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR game logic
*/

var pongR = (function (myPongR, $, ko) {

    // TODO: add functions that will perform hit-checks with the walls or the bars, goal-check and ball movements
    myPongR.setupMatch = function (opts) {
        app = new pongR.App(opts.PlayRoomId, opts.Player1, opts.Player2, opts.BallDirection);
        
        if (opts.Player1.Username === pongRHub.username) {
            me = app.player1;
        }
        else {
            me = app.player2;
        }

        ko.applyBindings(app);
    };

    myPongR.computeState = function () {

    };

    myPongR.animateBall = function () {

    };

    myPongR.animateMyBar = function (e) {
        var keyCode = e.keyCode;
        var newMarginTop = me.barMarginTop();
        // Down Arrow
        if (keyCode === 40) {
            newMarginTop += myPongR.BAR_SCROLL_UNIT;
        }
        // Up Arrow
        else if (keyCode === 38) {
            newMarginTop -= myPongR.BAR_SCROLL_UNIT;
        }
        me.barMarginTop(newMarginTop);
    };

    return myPongR;
} (pongR, jQuery, ko));