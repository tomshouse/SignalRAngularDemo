using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace CleverWareRendererMvvm
{
    public class ViewModel : IDisposable
    {
        public string Id { get { return this.GetHashCode().ToString(); } }

        private object _instance;

        private Type _instanceType;

        private bool _capturePropertyChangedEvents;

        private Dictionary<string, Action<string>> _changeBindings;

        private Dictionary<Type, Func<string, object>> _conversion;

        public Type InstanceType { get { return _instanceType; } }
        public ViewModel(object instance)
        {
            this._instance = instance;
            this._instanceType = instance.GetType();
            this._capturePropertyChangedEvents = false;
            this._changeBindings = new Dictionary<string, Action<string>>();
            this._conversion = new Dictionary<Type, Func<string, object>>();

            //TODO: Add any other property types that we support
            #region _conversion setup
            _conversion.Add(typeof(string), str =>
            {
                return str;
            });

            _conversion.Add(typeof(Boolean), str =>
            {
                return str.Equals(Boolean.TrueString, StringComparison.InvariantCultureIgnoreCase);
            });

            _conversion.Add(typeof(Int16), str =>
            {
                Int16 val;
                if (!Int16.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(UInt16), str =>
            {
                UInt16 val;
                if (!UInt16.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(Int32), str =>
            {
                Int32 val;
                if (!Int32.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(UInt32), str =>
            {
                UInt32 val;
                if (!UInt32.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(Int64), str =>
            {
                Int64 val;
                if (!Int64.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(UInt64), str =>
            {
                UInt64 val;
                if (!UInt64.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(double), str =>
            {
                double val;
                if (!double.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(float), str =>
            {
                float val;
                if (!float.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(decimal), str =>
            {
                decimal val;
                if (!decimal.TryParse(str, out val))
                    val = 0;
                return val;
            });

            _conversion.Add(typeof(int?), str =>
            {
                int? val;
                int iVal;
                if (str == "")
                    val = null;
                else if (int.TryParse(str, out iVal))
                    val = iVal;
                else
                    val = null;
                return val;
            });
            _conversion.Add(typeof(decimal?), str =>
            {
                decimal? val;
                decimal dVal;
                if (str == "")
                    val = null;
                else if (decimal.TryParse(str, out dVal))
                    val = dVal;
                else
                    val = null;
                return val;
            });
            #endregion
        }

        public object GetProperties()
        {
            return _instanceType
                .GetProperties()
                .Select(property => property.Name)
                .ToList();
        }

        public object GetPropertyValue(string propertyName)
        {
            var propInfo = _instanceType.GetProperty(propertyName);
            if (propInfo != null)
            {
                try
                {
                    return propInfo.GetValue(_instance);
                }
                catch (NullReferenceException)
                {
                    return string.Format("{0} not found", propertyName);
                }
            }
            else
            {
                return string.Format("{0} not found", propertyName);
            }

        }

        public void SetPropertyValue(string propertyName, string value)
        {
            var propInfo = _instanceType.GetProperty(propertyName);

            if (propInfo != null)
            {
                //TODO: Add any other property types that we support
                if (_conversion.ContainsKey(propInfo.PropertyType))
                {
                    try
                    {
                        propInfo.SetValue(_instance, _conversion[propInfo.PropertyType](value));
                    }
                    catch (NullReferenceException ex)
                    {
                        throw new ArgumentException(string.Format("{0} not found", propertyName), ex);
                    }
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("Missing Property Type Conversion");
                    throw new InvalidCastException("Missing Property Type Conversion in ViewModel!");
                }
            }
            else
            {
                throw new ArgumentException(string.Format("{0} not found", propertyName));
            }
        }

        public void ExecuteCommand(string commandName, Action<string> callbackComplete, object parameter = null)
        {
            var propInfo = _instanceType.GetProperty(commandName);
            var command = propInfo.GetValue(_instance);
            var commandType = command.GetType();
            var methodInfo = commandType.GetMethod("Execute");
            methodInfo.Invoke(command, new object[] { parameter });
            callbackComplete(commandName);
        }

        public ViewModel GetPropertyAsViewModelPartial(string propertyName)
        {
            var propInfo = _instanceType.GetProperty(propertyName);
            return new ViewModel(propInfo.GetValue(_instance));
        }

        public object Bind(string propertyName, Action<string> callbackChange)
        {
            if (!_capturePropertyChangedEvents)
            {
                if (!typeof(INotifyPropertyChanged).IsAssignableFrom(_instanceType))
                    return GetPropertyValue(propertyName);

                var notify = _instance as INotifyPropertyChanged;
                notify.PropertyChanged += notify_PropertyChanged;
                _capturePropertyChangedEvents = true;
            }

            _changeBindings[propertyName] = callbackChange;

            return GetPropertyValue(propertyName);
        }

        public void RemoveAllBindings()
        {
            _changeBindings.Clear();

            // Dispose of instance is disposable
            (_instance as IDisposable)?.Dispose();
        }

        private void notify_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (!_changeBindings.ContainsKey(e.PropertyName))
            {
                return;
            }
            var callback = _changeBindings[e.PropertyName];
            try
            {
                var propInfo = _instanceType.GetProperty(e.PropertyName);
                string value = propInfo.GetValue(_instance).ToString();
                callback(value);
            }
            catch (Exception ex)
            {
                callback(ex.ToString());
            }
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    RemoveAllBindings();
                }

                disposedValue = true;
            }
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion
    }
}
