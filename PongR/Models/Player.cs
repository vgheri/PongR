using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class Player
    {
        public User User { get; set; }
        public int PlayerNumber { get; set; }
        public string BarDirection { get; set; }
        public int BarMarginTop { get; set; }
        public Point TopLeftVertex { get; set; }
        public int BarWidth { get; set; }
        public int BarHeight { get; set; }
        public int Score { get; set; }
        public bool IsHost { get; set; }
        public List<PlayerInput> UnprocessedPlayerInputs { get; set; }
        public int LastProcessedInputId { get; set; }
    }
}