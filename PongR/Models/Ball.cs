using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class Ball
    {
        public int Radius { get; set; }
        public Point Position { get; set; }
        public string Direction { get; set; }
        public int Angle { get; set; }
        
        public Ball(string direction, int angle)
        {
            Radius = 10; // 1%
            Position = new Point(500, 300);            
            Direction = direction;
            Angle = angle;
        }
    }
}