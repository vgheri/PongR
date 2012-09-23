using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Timers;


namespace PongR.Models
{
    public static class Engine
    {
        // Store of couples <playerRoomId, GameStatus> 
        private static Dictionary<int, Game> _games = new Dictionary<int,Game>();
        private const int BAR_SCROLL_UNIT = 5; // px
        
        public static void AddGame(Game newGame)
        {
            if (!_games.ContainsKey(newGame.PlayRoomId))
            {
                _games.Add(newGame.PlayRoomId, newGame);
            }
        }

        public static void RemoveGame(int gameId)
        {
            if (_games.ContainsKey(gameId))
            {
                _games.Remove(gameId);
            }
        }

        public static void QueueInput(int gameId, string userId, PlayerInput input)
        {
            Game game;
            if (_games.TryGetValue(gameId, out game))
            {
                Player player = game.GetPlayer(userId);
                player.UnprocessedPlayerInputs.Add(input);
            }
        }

        // Specify what you want to happen when the Elapsed event is 
        // raised.
        public static void OnPhysicsTimedEvent(object source, ElapsedEventArgs e)
        {
            Engine.ProcessGamesTick();
        }

        // Specify what you want to happen when the Elapsed event is 
        // raised.
        public static void OnUpdateClientsTimedEvent(object source, ElapsedEventArgs e)
        {
            Engine.UpdateClients();
        }

        /// <summary>
        /// Physics loop where, for each game registered in _games we process its state based on users inputs
        /// </summary>
        private static void ProcessGamesTick()
        {
            foreach(var game in _games.Values)
            {
                ProcessTick(game);
            }
        }

        private static void UpdateClients()
        {
            // Send to each group the updated Game object (maybe I need to add properties to it...)
            foreach (var game in _games.Values)
            {
                Notifier.UpdateClients(game);
            }
        }

        /// <summary>
        /// Compute the next state for this game, based on player inputs and ball position
        /// </summary>
        /// <param name="game"></param>
        private static void ProcessTick(Game game)
        {
            // 1: Apply inputs received from players (and progressively remove them from the buffer)
            // 2: Update ball position
            // 3: Check for collisions and if collision, update ball status
            // 4: If no collision, check for a goal condition and update status if goal
            
            // 1: TODO Write Unit Test
            MovePlayer(game.Player1);
            MovePlayer(game.Player2);
            // 2: TODO Write Unit Test
            UpdateBallPosition(game.Ball); // Just update (X,Y) based on the angle
            // 3: TODO Write Unit Test
            if (!CheckCollisions(game))
            {
                // 4: TODO Write Unit Test
                CheckGoalConditionAndUpdateStatus(game);                
            }
        }
        
        /// <summary>
        /// Apply inputs received from players (and progressively remove them from the buffer)
        /// </summary>
        /// <param name="player"></param>
        private static void MovePlayer(Player player)
        {
            int lastInputExecuted = -1;
            foreach (var input in player.UnprocessedPlayerInputs)
            {
                lastInputExecuted = input.Id;
                if (input.Command == Command.Up)
                {                    
                    if (player.BarMarginTop - BAR_SCROLL_UNIT >= 5)
                    {  // 0 + 5 (minimum distance from border)
                        player.BarMarginTop -= BAR_SCROLL_UNIT;
                        player.BarDirection = "up";
                    }
                }
                else if (input.Command == Command.Down)
                {
                    if (player.BarMarginTop + BAR_SCROLL_UNIT <= 70)
                    {  // 100 - 25 (bar height) - 5 (mininum distance from border)
                        player.BarMarginTop += BAR_SCROLL_UNIT;
                        player.BarDirection = "down";
                    }
                }
                // Remove the just processed command
                player.UnprocessedPlayerInputs.Remove(input);
            }
            player.LastProcessedInputId = lastInputExecuted;
        }

        /// <summary>
        /// Update ball position
        /// </summary>
        /// <param name="ball"></param>
        private static void UpdateBallPosition(Ball ball)
        {
            switch (ball.Angle)
            {
                case 0:
                    ball.Coordinates.X += ball.FixedStep;
                    break;
                case 45:
                    ball.Coordinates.X += ball.FixedStep;
                    ball.Coordinates.Y -= ball.FixedStep;
                    break;
                case 135:
                    ball.Coordinates.X -= ball.FixedStep;
                    ball.Coordinates.Y -= ball.FixedStep;
                    break;
                case 180:
                    ball.Coordinates.X -= ball.FixedStep;
                    break;
                case 225:
                    ball.Coordinates.X -= ball.FixedStep;
                    ball.Coordinates.Y += ball.FixedStep;
                    break;
                case 315:
                    ball.Coordinates.X += ball.FixedStep;
                    ball.Coordinates.Y += ball.FixedStep;
                    break;
                default:
                    throw new Exception("Unknown angle value");
            }
        }

        private static bool CheckCollisions(Game game)
        {
            // check for collision
            // if collision with players' bar or field, update ball state (set next angle, next direction etc...)
            var collision = CheckCollisionWithPlayer(game);
            // No collision with player's bar, let's check if we have a collision with the field delimiters or if we have a goal condition
            if (!collision)
            {
                collision = CheckCollisionWithFieldDelimiters(game);                
            }

            return collision;
        }

        private static bool CheckCollisionWithFieldDelimiters(Game game)
        {
            var fieldCollision = false;
            int newAngle = -1;
            // Hit check. I check first for y axis because it's less frequent that the condition will be true, so most of the time 
            // we check only 1 if statement instead of 2 
            // We consider a hit when the ball is very close to the field delimiter (+/-5 px)
            if ((game.Ball.Coordinates.Y >= game.FieldTopLeftVertex.Y - 5 && game.Ball.Coordinates.Y <= game.FieldTopLeftVertex.Y + 5) ||
                    (game.Ball.Coordinates.Y >= game.FieldTopLeftVertex.Y + game.FieldHeight - 5 && game.Ball.Coordinates.Y <= game.FieldTopLeftVertex.Y + game.FieldHeight + 5))
            {
                if (game.Ball.Coordinates.X >= game.FieldTopLeftVertex.X && game.Ball.Coordinates.X <= game.FieldTopLeftVertex.X + game.FieldWidth)
                {

                    fieldCollision = true;
                    newAngle = CalculateNewAngleAfterFieldHit(game.Ball.Angle, game.Ball.Direction);
                }
            }
            if (fieldCollision)
            {
                game.Ball.Angle = newAngle;
            }
            return fieldCollision;
        }

        private static bool CheckCollisionWithPlayer(Game game)
        {
            var barCollision = false;
            string newBallDirection = string.Empty;
            int newAngle = 0;
            if (game.Player1.TopLeftVertex.X + game.Player1.BarWidth >= game.Ball.Coordinates.X - game.Ball.Radius)
            {
                if ((game.Player1.TopLeftVertex.Y <= game.Ball.Coordinates.Y + game.Ball.Radius)
                    && (game.Player1.TopLeftVertex.Y + game.Player1.BarHeight >= game.Ball.Coordinates.Y - game.Ball.Radius))
                {
                    barCollision = true;
                    newBallDirection = "right";
                    newAngle = CalculateNewAngleAfterPlayerHit(game.Player1, newBallDirection);
                }
            }
            else if (game.Player2.TopLeftVertex.X <= game.Ball.Coordinates.X + game.Ball.Radius)
            {
                if ((game.Player2.TopLeftVertex.Y <= game.Ball.Coordinates.Y + game.Ball.Radius)
                    && (game.Player2.TopLeftVertex.Y + game.Player2.BarHeight >= game.Ball.Coordinates.Y - game.Ball.Radius))
                {
                    barCollision = true;
                    newBallDirection = "left";
                    newAngle = CalculateNewAngleAfterPlayerHit(game.Player2, newBallDirection);
                }
            }
            if (barCollision)
            {
                game.Ball.Angle = newAngle;
                game.Ball.Direction = newBallDirection;
            }
            return barCollision;
        }

        private static int CalculateNewAngleAfterFieldHit(int oldAngle, string ballDirection)
        {
            int newAngle = 0;
            if (ballDirection == "right" && oldAngle == 45) {
                newAngle = 315;
            }
            else if (ballDirection == "right" && oldAngle == 315) {
                newAngle = 45;
            }
            else if (ballDirection == "left" && oldAngle == 135) {
                newAngle = 225;
            }
            else if (ballDirection == "left" && oldAngle == 225) {
                newAngle = 135;
            }
            else {                
                throw new Exception("Unknown new angle value");
            }
            return newAngle;
        }

        private static int CalculateNewAngleAfterPlayerHit(Player player, string newBallDirection)
        {
            int angle = 0;
            if (newBallDirection == "right" && player.BarDirection == "") {
                angle = 0;
            }
            else if (newBallDirection == "right" && player.BarDirection == "up") {
                angle = 45;
            }
            else if (newBallDirection == "left" && player.BarDirection == "up") {
                angle = 135;
            }
            else if (newBallDirection == "left" && player.BarDirection == "") {
                angle = 180;
            }
            else if (newBallDirection == "left" && player.BarDirection == "down") {
                angle = 225;
            }
            else if (newBallDirection == "right" && player.BarDirection == "down") {
                angle = 315;
            }
            else {
                throw new Exception("Unknown new angle value");
            }
            return angle;
        }
                
        private static bool CheckGoalConditionAndUpdateStatus(Game game)
        {
            var goal = false;
            if (game.Ball.Coordinates.X <= game.FieldTopLeftVertex.X)
            {
                game.Player2.Score++;
                goal = true;
            }
            else if (game.Ball.Coordinates.X >= game.FieldTopLeftVertex.X + game.FieldWidth)
            {
                game.Player1.Score++;
                goal = true;
            }
            return goal;
        }
    }
}