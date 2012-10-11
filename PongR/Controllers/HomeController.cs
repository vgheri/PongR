using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PongR.Models;

namespace PongR.Controllers
{
    public class HomeController : Controller
    {
        private InMemoryUserRepository _userRepository;
        private InMemoryRoomRepository _roomRepository;

        public HomeController()
        {
            this._userRepository = InMemoryUserRepository.GetInstance();
            this._roomRepository = InMemoryRoomRepository.GetInstance();
        }

        //
        // GET: /Home/

        public ActionResult Index()
        {
            return View();
        }

        //
        // POST: /Home/

        [HttpPost]
        public ActionResult Index(string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                ModelState.AddModelError("username", "Username is required");
                return View();
            }
            else
            {                
                // if we have an already logged user with the same username, then append a random number to it
                if (_userRepository.ConnectedUsers.Where(u => u.Username.Equals(username)).ToList().Count > 0)
                {
                    username = _userRepository.GetRandomizedUsername(username);
                }                     
                return View("PongR", "_Layout", username);
            }
        }

        public ActionResult Test()
        {
            return View();
        }

    }
}
