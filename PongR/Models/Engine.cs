using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public static class Engine
    {
        // Store of couples <playerRoomId, GameStatus> 
        private static Dictionary<int, Game> _games;
        private const int BAR_SCROLL_UNIT = 5; // px

        public static void AddGame(Game newGame)
        {
            if (!_games.ContainsKey(newGame.PlayRoomId))
            {
                _games.Add(newGame.PlayRoomId, newGame);
            }
        }

        /// <summary>
        /// Physics loop where, for each game registered in _games we process its state based on users inputs
        /// </summary>
        public static void ProcessGamesTick()
        {
            foreach(var game in _games.Values)
            {
                ProcessTick(game);
            }
        }

        public static void UpdateClients()
        {
            // Send to each group the updated Game object (maybe I need to add properties to it...)
        }

        /// <summary>
        /// Compute the next state for this game, based on player inputs and ball position
        /// </summary>
        /// <param name="game"></param>
        private static void ProcessTick(Game game)
        {
            // 1: Apply inputs received from players (and progressively remove them from the buffer)
            // 2: Update ball position using the delta function
            // 3: Check for collisions
            // 4: If collision, update ball status
            // 5: If no collision, check for a goal condition
            // 6: If goal, update status            

            // 1: TODO Write Unit Test
            MovePlayer(game.Player1);
            MovePlayer(game.Player2);
            // 2: TODO Write Unit Test
            UpdateBallPosition(game.Ball); // Just update (X,Y) based on the angle
            // 3: TODO Write Unit Test
            if (CheckCollisions(game))
            {
                // 4: TODO Write Unit Test
                UpdateBallStatus(game.Ball); // Change angle and direction
            }            
            else
            {
                // 5: TODO Write Unit Test
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
        }

        /// <summary>
        /// Update ball position using the delta function
        /// </summary>
        /// <param name="ball"></param>
        private static void UpdateBallPosition(Ball ball)
        {

        }

        private static void CheckGoalConditionAndUpdateStatus(Game game)
        {
            throw new NotImplementedException();
        }

        private static void UpdateBallStatus(Ball ball)
        {
            throw new NotImplementedException();
        }

        private static bool CheckCollisions(Game game)
        {
            throw new NotImplementedException();
        }
        
    }
}