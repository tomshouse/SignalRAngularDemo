using System;
using System.Collections.Generic;
using System.Reflection;

namespace CleverWareRendererMvvm
{
    public class ViewModelRepository
    {
        private static Dictionary<string, ViewModel> _viewModels = new Dictionary<string, ViewModel>();

        private Assembly _assembly;

        public ViewModelRepository(Assembly assembly)
        {
            this._assembly = assembly;
        }

        public ViewModel Create(string name)
        {
            var type = _assembly.GetType(name);
            var instance = Activator.CreateInstance(type);
            var vm = new ViewModel(instance);
            _viewModels[vm.GetHashCode().ToString()] = vm;
            return vm;
        }

        public bool Remove(string id)
        {
            bool result = false;
            if (!_viewModels.ContainsKey(id))
                return false;

            try
            {
                ViewModel vm = _viewModels[id];
                result = _viewModels.Remove(id);
                vm.Dispose();
            }
            catch (Exception)
            {

            }

            return result;
        }

        public bool Contains(string id)
        {
            return GetViewModel(id) != null;
        }

        public void Add(ViewModel vm)
        {
            _viewModels[vm.GetHashCode().ToString()] = vm;
        }

        public ViewModel GetViewModel(string id)
        {
            if (!_viewModels.ContainsKey(id))
                return null;

            return _viewModels[id];
        }
    }
}
