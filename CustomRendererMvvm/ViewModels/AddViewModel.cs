using System;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Command;

namespace CleverWareRendererMvvm
{
    public class AddViewModel : ViewModelBase
    {
        private int _number1 = 0;

        public int InNumber1
        {
            get { return _number1; }
            set
            {
                System.Diagnostics.Debug.WriteLine($"Setting InNumber1: {value}");
                _number1 = value;              
                RaisePropertyChanged();
            }
        }

        private int _number2 = 0;

        public int InNumber2
        {
            get { return _number2; }
            set
            {
                System.Diagnostics.Debug.WriteLine($"Setting InNumber1: {value}");
                _number2 = value;               
                RaisePropertyChanged();
            }
        }

        private int _outNumber = 0;

        public int OutNumber
        {
            get { return _outNumber; }
            set
            {
                System.Diagnostics.Debug.WriteLine($"Setting OutNumber: {value}");
                _outNumber = value;
                RaisePropertyChanged();
            }
        }

        public RelayCommand AddCommand { get; set; }
        public RelayCommand<string> SendCommand { get; set; }

        public AddViewModel()
        {
            AddCommand = new RelayCommand(Add);
            SendCommand = new RelayCommand<string>(Send);
        }

        private void Add()
        {
            System.Diagnostics.Debug.WriteLine($"Calling Add from AddCommand");
            //OutNumber = InNumber1 + InNumber2;
            OutNumber++;
        }


        private void Send(string test)
        {
            System.Diagnostics.Debug.WriteLine($"Calling Send with {test}");
            
        }
    }
}
