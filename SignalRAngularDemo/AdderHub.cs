using GalaSoft.MvvmLight;
using Microsoft.AspNetCore.SignalR;
using SignalRAngularDemo.MVVM;
using System.Reflection;

namespace SignalRAngularDemo
{
    public class AdderHub : Hub
    {
        private readonly IHubContext<AdderHub> _hubContext;
        public AdderHub(IHubContext<AdderHub> hubContext)
        {
            _hubContext = hubContext;
        }

        private  MVVM.ViewModelRepository vmRepository = new MVVM.ViewModelRepository(Assembly.GetExecutingAssembly());

        public async Task SendSum(int a, int b)
        {
            int sum = a + b;
            await Clients.All.SendAsync("ReceiveSum", sum);
        }

        public async Task SendMessage(string id ,string message)
        {
            var model = vmRepository.GetViewModel(id);
            await Clients.All.SendAsync("ReceiveMessage", "Received" + message);
        }

        public async Task CreateViewModelRequest(string viewModelName, string id)
        {
            var vm = await Task.Run(() => vmRepository.Create(viewModelName, id));
        }
        public async Task DestroyViewModelRequest( string id)
        {
            await Task.Run(() => vmRepository.Remove(id)); 
        }

        public async Task GetPropertyAsViewModelRequest(string parentId, string property, string childId )
        {
            ViewModel vm = vmRepository.GetViewModel(parentId);
            var child = await Task.Run(() => vm.GetPropertyAsViewModelPartial(property, childId));
            if (!vmRepository.Contains(childId))
            {
                vmRepository.Add(child);
            }
        }
        public async Task SetPropertyValue(string id, string property, string value)
        {
            ViewModel vm = vmRepository.GetViewModel(id);
            // fake set to InNumber2
            await Task.Run(() => vm.SetPropertyValue(property, value));
            await Task.Run(() => vm.SetPropertyValue("InNumber2", "22"));
        }

        public async Task BindToProperty(string id, string property, string onChanged, string callback)
        {
            ViewModel vm = vmRepository.GetViewModel(id);
            await Task.Run(() => vm.Bind( property, (newValue) =>
            {
                // Call the JavaScript function specified by 'onChanged' with the new value
                _hubContext.Clients.All.SendAsync("OnPropertyChanged", id, property, newValue);
            })); 
        }
    }
}
