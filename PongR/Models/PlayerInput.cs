using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class PlayerInput
    {
        public int SequenceNumber { get; set; }
        public List<Command> Commands { get; set; }
    }
}