using ChatRoom.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;


namespace ChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        public async Task Login(ChatViewModel model)
        {
            await Clients.All.SendAsync("Online", model);
        }

        public async Task Logout(ChatViewModel model)
        {
            await Clients.All.SendAsync("Online", model);
        }

        public async Task Send(ChatViewModel model)
        {
            await Clients.All.SendAsync("Receive", model);
        }
    }
}
