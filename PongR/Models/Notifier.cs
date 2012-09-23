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
            var context = GlobalHost.ConnectionManager.GetHubContext<PongRHub>();
            context.Clients[game.PlayRoomId].updateGame(game);
        }
    }
}