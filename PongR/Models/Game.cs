using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class Game
    {
        public int PlayRoomId { get; set; }
        public Player Player1 { get; set; }
        public Player Player2 { get; set; }
        public Ball Ball { get; set; }
        public Point FieldTopLeftVertex { get; set; }
        public int FieldWidth { get; set; }
        public int FieldHeight { get; set; }
        public bool IsGoal { get; set; }
    }
}
