using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.CSharp.RuntimeBinder;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;

namespace SignalRAngularDemo.MVVM
{
    public class SignalRBinder
    {
        private static BinderCore _binder = null;

        public SignalRBinder()
        {
            if (_binder == null)
            {
                _binder = new BinderCore();
                _binder.Initialize();
            }
        }
        public Task<object> Initialize(dynamic obj)
        {
#if DEBUG_SPECIAL
            System.Diagnostics.Debugger.Launch();
            if ((int)System.Diagnostics.Process.GetCurrentProcess().ProcessorAffinity > 3)
            {//must be desktop
                _logger?.LogDebug("processor affinity={0}", System.Diagnostics.Process.GetCurrentProcess().ProcessorAffinity);
                System.Diagnostics.Process.GetCurrentProcess().ProcessorAffinity = (System.IntPtr)(0xF << 4); //force to fewer CPU for better correspondence to GreyHawk MDT
                _logger?.LogDebug("processor limited to fewer cores, new affinity={0}", System.Diagnostics.Process.GetCurrentProcess().ProcessorAffinity);
            }
#endif
            _binder = new BinderCore();
            // Register for unhandled exceptions            
            AppDomain.CurrentDomain.UnhandledException += CurrentDomainException;
            return SyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                return _binder.Initialize();
                //var result = _binder.Initialize((string)objAsDictionary["path"]);

            });
        }
        public Task<object> DestroyViewModel(dynamic obj)
        {
            return SyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                return _binder.DestroyViewModel((string)objAsDictionary["id"]);
            });
        }
        public Task<object> GetProperties(dynamic obj)
        {
            return AsyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                return _binder.GetProperties((string)objAsDictionary["id"]);
            });
        }

        public Task<object> GetPropertyValue(dynamic obj)
        {
            return AsyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                string id = (string)objAsDictionary["id"];
                string property = (string)objAsDictionary["property"];
                try
                {
                    return _binder.GetPropertyValue(id, property);
                }
                catch (Exception ex)
                {
                    //_logger?.LogError(ex, "GetPropertyValue Failed id: {0} property: {1}", id, property);
                    throw;
                }
            });
        }

        public Task<object> SetPropertyValue(dynamic obj)
        {
            return AsyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                string id = (string)objAsDictionary["id"];
                string property = (string)objAsDictionary["property"];
                string value = (string)objAsDictionary["value"];
                try
                {
                    return _binder.SetPropertyValue(id, property, value);
                }
                catch (Exception ex)
                {
                   // _logger?.LogError(ex, "SetPropertyValue Failed id: {0} property: {1} value: {2}", id, property, value);
                    throw;
                }
            });
        }

        public Task<object> GetPropertyAsViewModel(dynamic obj)
        {
            return SyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                return _binder.GetPropertyAsViewModel((string)objAsDictionary["id"], (string)objAsDictionary["property"]);
            });
        }

        public Task<object> BindToProperty(dynamic obj)
        {
            return SyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                return _binder.BindToProperty((string)objAsDictionary["id"], (string)objAsDictionary["property"], (Action<string>)objAsDictionary["onChanged"]);
            });
        }

        public Task<object> ExecuteCommand(dynamic obj)
        {
            return AsyncTask(() =>
            {
                if (obj == null)
                {
                    //_logger?.LogError("EdgeBinder ExecuteCommand Failed- null obj");
                    return null;
                }
                var objAsDictionary = (IDictionary<string, object>)obj;
                return _binder.ExecuteCommand((string)objAsDictionary["id"], (string)objAsDictionary["command"], (Action<string>)objAsDictionary["onComplete"], (object)objAsDictionary["parameter"]);
            });
        }

        public Task<object> RemoveAllBindings(dynamic obj)
        {
            return SyncTask(() =>
            {
                var objAsDictionary = (IDictionary<string, object>)obj;
                return _binder.RemoveAllBindings((string)objAsDictionary["id"]);
            });
        }

        private Task<object> SyncTask(Func<object> function)
        {
            var task = AsyncTask(function);
            task.Wait();
            return task;
        }

        private Task<object> AsyncTask(Func<object> function)
        {
            return Task.Factory.StartNew<object>(() =>
            {
                try
                {
                    if (function == null)
                    {
                        //_logger?.LogError("CleverElectronMvvm EdgeBinder AsynTask Failed- null function");
                        return null;
                    }
                    return function.Invoke();
                }
                catch (Exception ex)
                {
                    //_logger?.LogError(ex, "CleverElectronMvvm EdgeBinder AsynTask Failed!");
                    return null;
                }
            });
        }

        private void CurrentDomainException(object sender, UnhandledExceptionEventArgs e)
        {
            OnUnhandledException(sender.ToString(), (Exception)e.ExceptionObject);
        }

        private void OnUnhandledException(object sender, Exception e)
        {
            // Log error and exit
            //_logger?.LogError(e, sender.ToString());

            Environment.Exit(-1);
        }
    }
}
