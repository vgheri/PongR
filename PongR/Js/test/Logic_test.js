/*
 * Author: Valerio Gheri, 8/10/2012 
 * Unit Tests for Logic.js, using qUnit
 */

//calculateNewAngleAfterPlayerHit(player, newBallAngle) : number
test("Test for calculateNewAngleAfterPlayerHit", function () {
    // Test 1
    var player = { barDirection: "up", playerNumber: 1 };
    var angle = PongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, 45);
    // Test 2
    player = { barDirection: "down", playerNumber: 1 }
    angle = PongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, 315);
    // Test 4
    player = { barDirection: "down", playerNumber: 2 }
    angle = PongR.calculateNewAngleAfterPlayerHit(player, "left");
    equal(angle, 225);
    // Test 4
    player = { barDirection: "up", playerNumber: 2 }
    angle = PongR.calculateNewAngleAfterPlayerHit(player, "left");
    equal(angle, 135);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = PongR.calculateNewAngleAfterPlayerHit(player, "left");
    equal(angle, 180);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = PongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, 0);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = PongR.calculateNewAngleAfterPlayerHit(player, "up");
    equal(angle, undefined);
    // Test 6
    player = { barDirection: "left", playerNumber: 1 }
    angle = PongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, undefined);
});

//calculateNewAngleAfterFieldHit(oldAngle, ballDirection) : number
test("Test for calculateNewAngleAfterFieldHit", function () {
    // Test 1
    var angle = PongR.calculateNewAngleAfterFieldHit(45, "right");
    equal(angle, 315);
    // Test 2
    angle = PongR.calculateNewAngleAfterFieldHit(315, "right");
    equal(angle, 45);
    // Test 1
    angle = PongR.calculateNewAngleAfterFieldHit(135, "left");
    equal(angle, 225);
    // Test 1
    angle = PongR.calculateNewAngleAfterFieldHit(225, "left");
    equal(angle, 135);
    // Test 1
    angle = PongR.calculateNewAngleAfterFieldHit(45, "left");
    equal(angle, undefined);
});

//checkCollisionWithPlayer(player, ball) : boolean
test("Check collision with player", function () {
    // Test 1 
    var player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 20
    };
    var ball = {
        position: { x: 20, y: 8 },
        radius: 5
    };
    var collision = PongR.checkCollisionWithPlayer(player, ball);
    equal(collision, true);
    // Test 2 
    player = {
        topLeftVertex: { x: 10, y: 50 },
        barWidth: 10,
        barHeight: 20
    };
    ball = {
        position: { x: 20, y: 8 },
        radius: 5
    };
    collision = PongR.checkCollisionWithPlayer(player, ball);
    equal(collision, false);
    // Test 3 
    player = {
        topLeftVertex: { x: 10, y: 50 },
        barWidth: 10,
        barHeight: 20
    };
    ball = {
        position: { x: 38, y: 8 },
        radius: 5
    };
    collision = PongR.checkCollisionWithPlayer(player, ball);
    equal(collision, false);
    // Test 4
    player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 20
    };
    ball = {
        position: { x: 16, y: 15 },
        radius: 5
    };
    collision = PongR.checkCollisionWithPlayer(player, ball);
    equal(collision, true);
});

//checkCollisionWithFieldDelimiters(ball, fieldWidth, fieldHeight) : boolean
test("Check collision with player", function () {
    // Test 1     
    var ball = {
        position: { x: 20, y: 8 },
        radius: 5
    };
    var collision = PongR.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    equal(collision, false);
    // Test 2 
    ball = {
        position: { x: 250, y: 8 },
        radius: 5
    };
    collision = PongR.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    equal(collision, true);
    // Test 3 
    ball = {
        position: { x: 150, y: 594 },
        radius: 5
    };
    collision = PongR.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    equal(collision, true);
    // Test 4
    ball = {
        position: { x: 150, y: 595 },
        radius: 5
    };
    collision = PongR.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    equal(collision, true);
    // Test 5
    ball = {
        position: { x: 150, y: 596 },
        radius: 5
    };
    collision = PongR.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    equal(collision, true);
});

//updateBallPosition(angle, position) : Point
test("Test updateBallPosition", function () {
    // Test 1
    var angle = 45;
    var position = { x: 50, y: 50 };
    var newPosition = PongR.updateBallPosition(angle, position);
    var expectedNewPosition = { x: 55, y: 55 };
    equal(newPosition, expectedNewPosition);
    // Test 2
    angle = 135;
    newPosition = PongR.updateBallPosition(angle, position);
    expectedNewPosition = { x: 45, y: 55 };
    equal(newPosition, expectedNewPosition);
    // Test 3
    angle = 180;
    newPosition = PongR.updateBallPosition(angle, position);
    expectedNewPosition = { x: 45, y: 50 };
    equal(newPosition, expectedNewPosition);
    // Test 4
    angle = 225;
    newPosition = PongR.updateBallPosition(angle, position);
    expectedNewPosition = { x: 45, y: 45 };
    equal(newPosition, expectedNewPosition);
    // Test 5
    angle = 315;
    newPosition = PongR.updateBallPosition(angle, position);
    expectedNewPosition = { x: 55, y: 45 };
    equal(newPosition, expectedNewPosition);
    // Test 6
    angle = 0;
    newPosition = PongR.updateBallPosition(angle, position);
    expectedNewPosition = { x: 55, y: 50 };
    equal(newPosition, expectedNewPosition);
});

//process_input(player) : number // returns the increment on the y axis
test("Test process_input", function () {
    // Test 1
    var commands1 = ["up", "up"];
    var inputs = [{ commands: commands1, sequenceNumber: 0}];
    var player = { inputs: inputs, lastProcessedInputId: -1 };
    var expectedIncrement = 10;
    var observedIncrement = PongR.process_input(player);
    equal(observedIncrement, expectedIncrement);
    equal(player.lastProcessedInputId, 0);
    // Test 2    
    commands1 = ["up", "down"];
    inputs = [{ commands: commands1, sequenceNumber: 1}];
    player = { inputs: inputs, lastProcessedInputId: 0 };
    expectedIncrement = 0;
    observedIncrement = PongR.process_input(player);
    equal(observedIncrement, expectedIncrement);
    equal(player.lastProcessedInputId, 1);
});

//updateSelfPosition(position, yIncrement, fieldHeight, settings.gap) : Point
test("Test updateSelfPosition", function () {
    // Test 1
    var position = { x: 30, y: 34 };
    var yIncrement = -5;
    var fieldHeight = 600;
    var gap = 30;
    var expectedPosition = { x: 30, y: 30 };
    var updatedPosition = PongR.updateSelfPosition(position, yIncrement, fieldHeight, gap);
    equal(expectedPosition, updatedPosition);
    // Test 1
    var position = { x: 30, y: 54 };
    var yIncrement = -5;
    var fieldHeight = 600;
    var gap = 30;
    var expectedPosition = { x: 30, y: 49 };
    var updatedPosition = PongR.updateSelfPosition(position, yIncrement, fieldHeight, gap);
    equal(expectedPosition, updatedPosition);
});