test("Test for calculateNewAngleAfterPlayerHit", function () {
    // Test 1
    var player = { barDirection: "up", playerNumber: 1 };
    var angle = pongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, 45);
    // Test 2
    player = { barDirection: "down", playerNumber: 1 }
    angle = pongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, 315);
    // Test 4
    player = { barDirection: "down", playerNumber: 2 }
    angle = pongR.calculateNewAngleAfterPlayerHit(player, "left");
    equal(angle, 225);
    // Test 4
    player = { barDirection: "up", playerNumber: 2 }
    angle = pongR.calculateNewAngleAfterPlayerHit(player, "left");
    equal(angle, 135);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = pongR.calculateNewAngleAfterPlayerHit(player, "left");
    equal(angle, 180);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = pongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, 0);
    // Test 5
    player = { barDirection: "", playerNumber: 2 }
    angle = pongR.calculateNewAngleAfterPlayerHit(player, "up");
    equal(angle, undefined);
    // Test 6
    player = { barDirection: "left", playerNumber: 1 }
    angle = pongR.calculateNewAngleAfterPlayerHit(player, "right");
    equal(angle, undefined);
});