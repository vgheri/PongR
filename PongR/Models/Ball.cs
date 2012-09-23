using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class Ball
    {
        public int Radius { get; set; }
        public Point Coordinates { get; set; }
        public string Direction { get; set; }
        public int Angle { get; set; }
        
        public Ball(string direction, int angle)
        {
            Radius = 2; // 2%
            Coordinates = new Point(50, 50);            
            Direction = direction;
            Angle = angle;
        }
    }
}