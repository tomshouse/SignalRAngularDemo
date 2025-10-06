import { identifierModuleUrl } from '@angular/compiler';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export  class SignalRService {
  private hubConnection!: signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.Debug)
      .withUrl('http://localhost:5001/adder') // Ensure this URL matches your backend SignalR hub URL
      .withAutomaticReconnect() // Enable automatic reconnect
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connection Started'))
      .catch(err => console.log('Error while starting SignalR connection: ' + err));
  }
 
  public OnPropertyChangedListener = (callback: (id: string, property: string, value:any) => void) => {
    this.hubConnection.on('OnPropertyChanged', callback);
  }
  public SetPropertyValueRequest = (id: string, property: string, value: string) => {
    this.hubConnection.invoke('SetPropertyValue', id, property, value)
      .catch(err => console.error(err));
  }
 public BindToPropertyRequest = (id: string, property: string, onChange: string, callback: string) => {
    this.hubConnection.invoke('BindToProperty', id, property, onChange, callback)
      .catch(err => console.error(err));
  } 
  public AddNumbers = (num1: number, num2:number) => {
    this.hubConnection.invoke('SendSum', num1, num2)
      .catch(err => console.error(err));
  }
public  SendMessage = (id: string, message: string) => {
    this.hubConnection.invoke('SendMessage', id, message)
      .catch(err => console.error(err));
  } 
 public addReceiveMessageListener = (callback: (message:string) => void) => {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  public addReceiveSumListener = (callback: (sum:number) => void) => {
    this.hubConnection.on('ReceiveSum', callback);
  }
  public CreateViewModelRequest = (viewModelName: string, id: string) => {
    this.hubConnection.invoke('CreateViewModelRequest', viewModelName, id);
  }

 public DestroyViewModelRequest = (id: string) => {
    this.hubConnection.invoke('DestroyViewModelRequest', id);
  }

  public GetPropertyAsViewModelRequest = (id: string, property: string, childId: string) => {
    this.hubConnection.invoke('GetPropertyAsViewModelRequest', id, property, childId);
  } 

  public ViewModelCreatedListener = (callback: (viewModelName: string, viewModelId:number) => void) => {
    this.hubConnection.on('ViewModelCreated', callback);
  } 
}``
