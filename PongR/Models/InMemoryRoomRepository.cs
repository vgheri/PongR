using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PongR.Models
{
    public class InMemoryRoomRepository
    {
        private static ICollection<PlayRoom> _rooms;
        private static InMemoryRoomRepository _instance;

        private InMemoryRoomRepository()
        {
            _rooms = new List<PlayRoom>();
        }

        public static InMemoryRoomRepository GetInstance()
        {
            if (_instance == null)
            {
                _instance = new InMemoryRoomRepository();
            }
            return _instance;
        }

        #region Repository Public Methods

        public IQueryable<PlayRoom> Rooms
        {
            get { return _rooms.AsQueryable(); }
        }

        public void Add(PlayRoom room)
        {
            if (_rooms.Contains(room))
            {
                _rooms.Add(room);
            }
        }

        public void Remove(PlayRoom room)
        {
            _rooms.Add(room);            
        }

        #endregion
    }
}