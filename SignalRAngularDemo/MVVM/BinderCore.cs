using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace SignalRAngularDemo.MVVM
{
    public class BinderCore
    {
        private ViewModelRepository _viewModelRepo = null;

        public BinderCore()
        {
            AppDomain currentDomain = AppDomain.CurrentDomain;
            //currentDomain.AssemblyResolve += new ResolveEventHandler(LoadFromSameFolder);
        }

        //static Assembly LoadFromSameFolder(object sender, ResolveEventArgs args)
        //{
        //    string folderPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        //    string assemblyPath = Path.Combine(folderPath, new AssemblyName(args.Name).Name + ".dll");
        //    if (File.Exists(assemblyPath) == false) return null;
        //    Assembly assembly = Assembly.LoadFrom(assemblyPath);
        //    return assembly;
        //}

        public object Initialize()
        {
            Type t  = this.GetType();
            //Type t = Type.GetType("zoo");
            _viewModelRepo = new ViewModelRepository(t.Assembly);
            return string.Empty;
        }

        //public object Initialize(string assemblyPath)
        //{
        //    var assembly = Assembly.LoadFile(assemblyPath);
        //    _viewModelRepo = new ViewModelRepository(assembly);
        //    return string.Empty;
        //}

        //public object CreateViewModel(string viewModelName)
        //{
        //    var vm = _viewModelRepo.Create(viewModelName);
        //    return vm.Id;
        //}

        public object DestroyViewModel(string id)
        {
            return _viewModelRepo.Remove(id);
        }

        public object GetProperties(string id)
        {
            return _viewModelRepo.GetViewModel(id).GetProperties();
        }

        public object GetPropertyValue(string id, string property)
        {
            var vm = _viewModelRepo.GetViewModel(id);
            object value = vm.GetPropertyValue(property);

            // TODO: Probably want to handle every property which is not a primitive type a special way to return it as {} or []
            if (value is List<string> && value != null)
            {
                return (value as List<string>).ToArray();
            }
            if (value is bool)
            {
                return value;
            }
            return value == null ? null : value; //.ToString();
        }

        public object GetPropertyAsViewModel(string id, string property)
        {
            ViewModel vm = _viewModelRepo.GetViewModel(id);
            var childId = property.GetHashCode().ToString();
            var child = vm.GetPropertyAsViewModelPartial(property,childId);
            if (!_viewModelRepo.Contains(childId))
            {
                _viewModelRepo.Add(child);
            }
            return childId;
        }

        public object SetPropertyValue(string id, string property, string value)
        {
            var vm = _viewModelRepo.GetViewModel(id);
            vm.SetPropertyValue(property, value);
            return null;
        }

        public object BindToProperty(string id, string property, Action<string> onChanged)
        {
            var vm = _viewModelRepo.GetViewModel(id);
            return vm.Bind(property, onChanged);
        }

        public object ExecuteCommand(string id, string command, Action<string> onComplete, object parameter = null)
        {
            var vm = _viewModelRepo.GetViewModel(id);
            vm.ExecuteCommand(command, onComplete, parameter);
            return null;
        }

        public object RemoveAllBindings(string id)
        {
            var vm = _viewModelRepo.GetViewModel(id);
            vm.RemoveAllBindings();
            return null;
        }
    }
}
