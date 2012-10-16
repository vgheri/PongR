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
        
        public Ball(string direction, int angle, int fieldWidth, int fieldHeight)
        {
            Radius = 10; // 1%
            Position = new Point(fieldWidth/2, fieldHeight/2);            
            Direction = direction;
            Angle = angle;
        }

        public void ResetBallToInitialPosition(string direction, int angle, int fieldWidth, int fieldHeight) 
        {
            this.Position = new Point(fieldWidth / 2, fieldHeight / 2);            
            this.Direction = direction;
            this.Angle = angle;            
        }
    }
}