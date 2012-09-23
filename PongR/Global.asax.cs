using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using PongR.Models;
using System.Timers;

namespace PongR
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );

        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            // TODO: remove this. For testing only. Clear repositories
            InMemoryUserRepository.GetInstance().ConnectedUsers.ToList().Clear();
            InMemoryUserRepository.GetInstance().WaitingList.ToList().Clear();
            InMemoryRoomRepository.GetInstance().Rooms.ToList().Clear();

            var physicsTimer = new System.Timers.Timer(15);
            physicsTimer.Enabled = true;
            // Hook up the Elapsed event for the timer.
            physicsTimer.Elapsed += new ElapsedEventHandler(Engine.OnPhysicsTimedEvent);
            
            var updateTimer = new Timer(45);
            updateTimer.Enabled = true;
            updateTimer.Elapsed += new ElapsedEventHandler(Engine.OnUpdateClientsTimedEvent);
        }
    }
}