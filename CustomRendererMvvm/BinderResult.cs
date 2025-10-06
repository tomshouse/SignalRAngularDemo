using System;
using System.Collections.Generic;
using System.Text;

namespace CleverWareRendererMvvm
{
    public class BinderResult
    {
        public bool ok;
        public object result;

        public static object Ok(object result)
        {
            return new BinderResult()
            {
                ok = true,
                result = result
            };
        }

        public static object NotOk(object result)
        {
            return new BinderResult()
            {
                ok = false,
                result = result
            };
        }
    }
}
