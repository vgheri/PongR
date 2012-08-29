using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class PlayRoom
    {
        public string Id { get; set; }
        public User Player1 { get; set; }
        public User Player2 { get; set; }        
    }
}