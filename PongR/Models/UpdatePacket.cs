using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class UpdatePacket
    {
        public Game Game { get; set; }
        // Server timestamp of when the update was sent. It's in the same format as a javascript new Date().getTime() object
        public string Timestamp { get; set; } 
    }
}