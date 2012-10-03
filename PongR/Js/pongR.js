/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR namespace js file with the Module pattern
*/

// Module creation
var pongR = (function ($) {
    var myPongR = {};

    myPongR.BAR_SCROLL_UNIT = 5; // px
    myPongR.BALL_FIXED_STEP = 10; // px is the fixed distance that the ball moves (both over x and y axis) between 2 frames

    return myPongR;
} (jQuery));