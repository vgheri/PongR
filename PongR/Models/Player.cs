using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace PongR.Models
{
    [DataContract]
    public class Player
    {
        [DataMember]
        public User User { get; set; }
        [DataMember]
        public int PlayerNumber { get; set; }
        [DataMember]
        public string BarDirection { get; set; }
        [DataMember]
        public Point TopLeftVertex { get; set; }        
        public int BarWidth { get; set; }        
        public int BarHeight { get; set; }
        [DataMember]
        public int Score { get; set; }
        public bool IsHost { get; set; }
        public Queue<PlayerInput> UnprocessedPlayerInputs { get; set; }
        [DataMember]
        public int LastProcessedInputId { get; set; }

        public Player(User user, int playerNumber, bool isHost, int fieldWidth)
        {
            User = user;
            PlayerNumber = playerNumber;
            BarDirection = "";
            BarWidth = 30; //px
            BarHeight = 96; //px
            var x = playerNumber == 1 ? 50 : (fieldWidth - 50 - BarWidth); //px
            var y = 252; //px
            TopLeftVertex = new Point(x, y);
            IsHost = isHost;
            Score = 0;
            UnprocessedPlayerInputs = new Queue<PlayerInput>();
            LastProcessedInputId = -1;
        }
    }
}