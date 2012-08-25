using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class InMemoryUserRepository
    {
        private static ICollection<User> _connectedUsers;
        private static ICollection<User> _waitingList;        
        private static InMemoryUserRepository _instance = null;
        private static readonly int max_random = 3;
        
        public static InMemoryUserRepository GetInstance()
        {
            if (_instance == null)
            {
                _instance = new InMemoryUserRepository();
            }
            return _instance;
        }

        #region Private methods

        private InMemoryUserRepository()
        {
            _connectedUsers = new List<User>();
            _waitingList = new List<User>();
        }

        #endregion

        #region Repository methods

        public IQueryable<User> ConnectedUsers { get { return _connectedUsers.AsQueryable(); } }

        public void AddUser(User user)
        {
            _connectedUsers.Add(user);
        }

        public void RemoveUser(User user)
        {
            _connectedUsers.Remove(user);
        }

        public IQueryable<User> WaitingList { get { return _waitingList.AsQueryable(); } }

        public void AddToWaitingList(User user)
        {
            _waitingList.Add(user);
        }

        public void RemoveFromWaitingList(User user)
        {
            _waitingList.Remove(user);
        }
                
        public string GetRandomizedUsername(string username)
        {
            string tempUsername = username;
            int newRandom = max_random, oldRandom = 0;
            int loops = 0;
            Random random = new Random();
            do
            {
                if (loops > newRandom)
                {
                    oldRandom = newRandom;
                    newRandom *= 2;
                }
                username = tempUsername + "_" + random.Next(oldRandom, newRandom).ToString();
                loops++;
            } while (GetInstance().ConnectedUsers.Where(u => u.Username.Equals(username)).ToList().Count > 0);

            return username;
        }

        #endregion
    }
}