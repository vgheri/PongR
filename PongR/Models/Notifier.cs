using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Routing;
using SignalR;
using SignalR.Hubs;
using PongR.Hubs;

namespace PongR.Models
{
    public class Notifier
    {
        // Synchronize clients with the new authoritative game status
        public static void UpdateClients(Game game)
        {
            var packet = new UpdatePacket()
            {
                Game = game,
                //Timestamp = DateTime.UtcNow.Subtract(new DateTime(1970,1,1,0,0,0,DateTimeKind.Utc)).TotalMilliseconds
                Timestamp = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm:ss:fff")
            };
            var context = GlobalHost.ConnectionManager.GetHubContext<PongRHub>();
            context.Clients[game.GameId].updateGame(packet);
        }
    }
}