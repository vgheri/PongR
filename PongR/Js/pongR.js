/*
* Author: Valerio Gheri
* Date: 28/08/2012
* Description: PongR namespace js file with the Module pattern
*/

// Module creation
var pongR = (function ($) {
    var myPongR = {};

    myPongR.BAR_SCROLL_UNIT = 5; // px
    myPongR.NOTIFICATION_FREQUENCY = 250; // norify player position to the server every 250 ms 

    return myPongR;
} (jQuery));