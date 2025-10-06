using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CleverWareRendererMvvm
{
    public class CleverWareLogger 
    {
        protected readonly ILogger _logger = null;
        public CleverWareLogger()
        {
            //_logger = LogManager.GetCurrentClassLogger("CleverWareMobile");
            //_logger.LogLevel = Common.Framework.Logging.LogLevel.Debug; //always start at max logs, then see FixLogLevel where it changes to match the app level
        }

        public Task<string> Debug(dynamic obj)
        {
            return AsyncTask(() =>
            {
                if (_logger != null)
                {
                    var objAsDictionary = (IDictionary<string, object>)obj;
                    _logger.LogDebug((string)objAsDictionary["message"]);
                    return true;
                }

                return false;
            });
        }

        public Task<string> Info(dynamic obj)
        {
            return AsyncTask(() =>
            {
                if (_logger != null)
                {
                    var objAsDictionary = (IDictionary<string, object>)obj;
                    _logger.LogInformation((string)objAsDictionary["message"]);
                    return true;
                }

                return false;
            });
        }

        public Task<string> Warn(dynamic obj)
        {
            return AsyncTask(() =>
            {
                if (_logger != null)
                {
                    var objAsDictionary = (IDictionary<string, object>)obj;
                    _logger.LogWarning((string)objAsDictionary["message"]);
                    return true;
                }

                return false;
            });
        }

        public Task<string> Error(dynamic obj)
        {
            return AsyncTask(() =>
            {
                if (_logger != null)
                {
                    var objAsDictionary = (IDictionary<string, object>)obj;
                    _logger.LogError((string)objAsDictionary["message"]);
                    return true;
                }

                return false;
            });
        }

        public Task<string> Event(dynamic obj)
        {
            return AsyncTask(() =>
            {
                if (_logger != null)
                {
                    var objAsDictionary = (IDictionary<string, object>)obj;
                    _logger.LogTrace((string)objAsDictionary["message"]);
                    return true;
                }

                return false;
            });
        }
        public Task<string> LogLevel(dynamic obj)
        {
            return SyncTask(() =>
            {
                if (_logger != null)
                {
                    //return (int)_logger.LogLevel;
                }

                return 1;
            });
        }

        public Task<string> DisableGpsPosition(dynamic obj)
        {
            return AsyncTask(() =>
            {
                if (_logger != null)
                {
                    var objAsDictionary = (IDictionary<string, object>)obj;
                    //LogManager.Instance.DisableGpsPosition = bool.Parse((string)objAsDictionary["value"]);
                    
                    return true;
                }

                return false;
            });
        }

        static Task<string> SyncTask(Func<object> function)
        {
            var task = AsyncTask(function);
            task.Wait();
            return task;
        }

        static Task<string> AsyncTask(Func<object> function)
        {
            return Task.Factory.StartNew(() =>
            {
                try
                {
                    var result = function.Invoke();
                    return JsonConvert.SerializeObject(BinderResult.Ok(result));
                }
                catch (Exception ex)
                {
                    return JsonConvert.SerializeObject(BinderResult.NotOk(ex.Message));
                }
            });
        }
    }
}
