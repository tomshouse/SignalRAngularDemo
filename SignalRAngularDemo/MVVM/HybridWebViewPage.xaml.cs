using Xamarin.Forms;

namespace CleverWareRendererMvvm
{
	public partial class HybridWebViewPage : ContentPage
	{
		public HybridWebViewPage ()
		{
			InitializeComponent ();

			hybridWebView.RegisterAction (data => DisplayAlert ("Alert", "Hello " + data, "OK"));
		}
	}
}
