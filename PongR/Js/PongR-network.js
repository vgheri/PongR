* Author: Valerio Gheri
* Date: 10/10/2012
* Description: PongR namespace js file with the Module pattern
*/

// Module creation
var PongR = (function ($, PongR) {
    
    this.pongRHub.opponentLeft = function() {
            alert("Opponent left. Going back to wait list");            
            //pongR.clearAnimation(requestAnimationFrameRequestId);            
            // TODO Implement a method that resets the game: names, score, objects position (resetAllPositionsToInitialState())
    };

    this.pongRHub.wait = function() {
            // TODO: Use a lightbox to display a waiting message
            alert("Wait. Do nothing.");
    }; 

    this.pongRHub.startMatch = function(opts) {
            // TODO: Populate all the view models and do the binding with knockout.
            // Set the timeout to compute game state and for notifying bars position
            // Set event handlers for keystrokes keyUp and KeyDown
            // Start to animate the ball
            this.self.startMatch(opts);                                                                                                                  
    };

    // Receives an updated game state from the server. Being the server authoritative, means that we have to apply this state to our current state
    this.pongRHub.updateGame = function(game) {
        //TODO
    }

    PongR.prototype.connect = function() {
        $.connection.hub.start()
                    .done(function () {
                        this.pongRHub.joined();
                    });
    };

    // sendInput(gameId : number, connectionId : string, input : PlayerInput) : void
    PongR.prototype.sendInput(gameId, connectionId, input) {
        this.pongRHub.queueInput(gameId, connectionId, input);
    }

    return PongR;
} (jQuery, PongR));