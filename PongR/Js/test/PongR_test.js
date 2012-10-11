/*
 * Author: Valerio Gheri, 8/10/2012 
 * Unit Tests for Logic.js, using qUnit
 */

PongR.createInstance(1000, 600, "test");

//calculateNewAngleAfterPlayerHit(player, newBallDirection) : number
test("Test for calculateNewAngleAfterPlayerHit", function () {
    // Test 1
    var player = { barDirection: "up", playerNumber: 1 };
    var angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "right");
    deepEqual(angle, 45);
    // Test 2
    player = { barDirection: "down", playerNumber: 1 }
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "right");
    deepEqual(angle, 315);
    // Test 4
    player = { barDirection: "down", playerNumber: 2 }
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "left");
    deepEqual(angle, 225);
    // Test 4
    player = { barDirection: "up", playerNumber: 2 }
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "left");
    deepEqual(angle, 135);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "left");
    deepEqual(angle, 180);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "right");
    deepEqual(angle, 0);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "up");
    deepEqual(angle, undefined);
    // Test 6
    player = { barDirection: "left", playerNumber: 1 }
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterPlayerHit(player, "right");
    deepEqual(angle, undefined);
});

//calculateNewAngleAfterFieldHit(oldAngle, ballDirection) : number
test("Test for calculateNewAngleAfterFieldHit", function () {
    // Test 1
    var angle = PongR.UnitTestPrototype.calculateNewAngleAfterFieldHit(45, "right");
    deepEqual(angle, 315);
    // Test 2
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterFieldHit(315, "right");
    deepEqual(angle, 45);
    // Test 1
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterFieldHit(135, "left");
    deepEqual(angle, 225);
    // Test 1
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterFieldHit(225, "left");
    deepEqual(angle, 135);
    // Test 1
    angle = PongR.UnitTestPrototype.calculateNewAngleAfterFieldHit(45, "left");
    deepEqual(angle, undefined);
});

//checkCollisionWithPlayer(player, ball) : boolean
test("Check collision with player", function () {
    // Test 1 
    var player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 1
    };
    var ball = {
        position: { x: 30, y: 20 },
        radius: 5
    };
    var collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, false);
    // Test 2 
    player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 1
    };
    ball = {
        position: { x: 25, y: 20 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 3 
    player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 1
    };
    ball = {
        position: { x: 22, y: 9 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 4
    player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 1
    };
    ball = {
        position: { x: 22, y: 39 },   
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 5
    player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 1
    };
    ball = {
        position: { x: 22, y: 41 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 6
    player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 1
    };
    ball = {
        position: { x: 18, y: 41 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 7
    player = {
        topLeftVertex: { x: 10, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 1
    };
    ball = {
        position: { x: 18, y: 46 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, false);
    // Test 7
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 94, y: 26 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, false);
    // Test 8
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 26 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 9
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 99, y: 26 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 10
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 4 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, false);
    // Test 11
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 5 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 12
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 34 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 13
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 35 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 14
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 36 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 15
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 40 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 16
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 41 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, true);
    // Test 17
    player = {
        topLeftVertex: { x: 100, y: 10 },
        barWidth: 10,
        barHeight: 30,
        playerNumber: 2
    };
    ball = {
        position: { x: 95, y: 46 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithPlayer(player, ball);
    deepEqual(collision, false);
});

//checkCollisionWithFieldDelimiters(ball, fieldWidth, fieldHeight) : boolean
test("Check collision with field", function () {
    // Test 1     
    var ball = {
        position: { x: 20, y: 18 },
        radius: 5
    };
    var collision = PongR.UnitTestPrototype.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    deepEqual(collision, false);
    // Test 2 
    ball = {
        position: { x: 250, y: 8 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    deepEqual(collision, true);
    // Test 3 
    ball = {
        position: { x: 150, y: 594 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    deepEqual(collision, true);
    // Test 4
    ball = {
        position: { x: 150, y: 595 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    deepEqual(collision, true);
    // Test 5
    ball = {
        position: { x: 150, y: 596 },
        radius: 5
    };
    collision = PongR.UnitTestPrototype.checkCollisionWithFieldDelimiters(ball, 1000, 600);
    deepEqual(collision, true);
});

//updateBallPosition(angle, position) : Point
test("Test updateBallPosition", function () {
    // Test 1
    var angle = 45;
    var position = { x: 50, y: 50 };
    var newPosition = PongR.UnitTestPrototype.updateBallPosition(angle, position);
    var expectedNewPosition = { x: 60, y: 40 };
    deepEqual(newPosition, expectedNewPosition);
    // Test 2
    angle = 135;
    newPosition = PongR.UnitTestPrototype.updateBallPosition(angle, position);
    expectedNewPosition = { x: 40, y: 40 };
    deepEqual(newPosition, expectedNewPosition);
    // Test 3
    angle = 180;
    newPosition = PongR.UnitTestPrototype.updateBallPosition(angle, position);
    expectedNewPosition = { x: 40, y: 50 };
    deepEqual(newPosition, expectedNewPosition);
    // Test 4
    angle = 225;
    newPosition = PongR.UnitTestPrototype.updateBallPosition(angle, position);
    expectedNewPosition = { x: 40, y: 60 };
    deepEqual(newPosition, expectedNewPosition);
    // Test 5
    angle = 315;
    newPosition = PongR.UnitTestPrototype.updateBallPosition(angle, position);
    expectedNewPosition = { x: 60, y: 60 };
    deepEqual(newPosition, expectedNewPosition);
    // Test 6
    angle = 0;
    newPosition = PongR.UnitTestPrototype.updateBallPosition(angle, position);
    expectedNewPosition = { x: 60, y: 50 };
    deepEqual(newPosition, expectedNewPosition);
});

//process_input(player) : number // returns the increment on the y axis
test("Test process_input", function () {
    // Test 1
    var commands1 = ["up", "up"];
    var inputs = [{ commands: commands1, sequenceNumber: 0}];
    var player = { inputs: inputs, lastProcessedInputId: -1 };
    var expectedIncrement = -10;
    var observedIncrement = PongR.UnitTestPrototype.process_input(player);
    deepEqual(observedIncrement, expectedIncrement);
    deepEqual(player.lastProcessedInputId, 0);
    // Test 2    
    commands1 = ["up", "down"];
    inputs = [{ commands: commands1, sequenceNumber: 1}];
    player = { inputs: inputs, lastProcessedInputId: 0 };
    expectedIncrement = 0;
    observedIncrement = PongR.UnitTestPrototype.process_input(player);
    deepEqual(observedIncrement, expectedIncrement);
    deepEqual(player.lastProcessedInputId, 1);
});

//updateSelfPosition(position, yIncrement, fieldHeight, settings.gap) : Point
test("Test updateSelfPosition", function () {
    // Test 1
    var position = { x: 30, y: 34 };
    var yIncrement = -5;
    var fieldHeight = 600;
    var gap = 30;
    var expectedPosition = { x: 30, y: 30 };
    var updatedPosition = PongR.UnitTestPrototype.updateSelfPosition(position, yIncrement, fieldHeight, gap);
    deepEqual(expectedPosition, updatedPosition);
    // Test 2
    var position = { x: 30, y: 54 };
    var yIncrement = -5;
    var fieldHeight = 600;
    var gap = 30;
    var expectedPosition = { x: 30, y: 49 };
    var updatedPosition = PongR.UnitTestPrototype.updateSelfPosition(position, yIncrement, fieldHeight, gap);
    deepEqual(expectedPosition, updatedPosition);
});


