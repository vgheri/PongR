using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class PlayRoom
    {
        private string Id { get; set; }
        private User Player1 { get; set; }
        private User Player2 { get; set; }        
    }
}