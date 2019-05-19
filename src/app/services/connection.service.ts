import { Injectable } from '@angular/core';
import { SmartGardenWebSocket } from '../modules/sgwebsocket';
// import { Socket, SocketIoConfig } from 'ng-socket-io';
// import io from 'socket.io-client';
const io = require('socket.io-client');

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  // wsServer: String = "ws://insys-cloud-websocket-server.herokuapp.com:80";
  wsServer: String = "ws://localhost:5000";
  socket: any;

  localSocket: SmartGardenWebSocket; // Socket for connect to local garden

  get wsConnected() { return this.socket.connected };
  get ws() { return this.socket }

  constructor() {
    // this.wsServer = "ws://localhost:80";
    this.socket = io(this.wsServer, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax : 5000,
      reconnectionAttempts: Infinity
    });

    this.socket.on("connect", () => {
      this.socket.emit("AppConnect", () => {
        console.log("App Connected!");
      })
    });
  }

  wsOn(event, callback) {
    this.socket.on(event, callback);
  }

  /**
   * 
   * @param args [event, ...params]
   */
  wsSend(...args) { 
    this.socket.emit.apply(this.socket, args);
  }

  joinToRoom(roomID, callback=null) {
    this.wsSend("Conn2Garden", roomID, (rs) => {
      if (callback) callback(rs);
    });
  }
  leaveRoom(roomID, callback=null) {
    this.wsSend("LeaveGarden", roomID, (rs) => {
      if (callback) callback(rs);
    });
  }



  /**************************************************
   *      Implements for Local Garden Connect       *
   **************************************************/

  setupConnectToLocalGarden(gardenIP: string = "") {
    if (this.localSocket) {
      if (this.localSocket.gardenIP != gardenIP) {
        this.localSocket.close();
        this.localSocket.gardenIP = gardenIP;
      }
      if (!this.localSocket.autoReconnect) {
        this.localSocket.reconnect();
      }
    }

    if (this.localSocket || !gardenIP || typeof(gardenIP) != "string") return;
    this.localSocket = new SmartGardenWebSocket(gardenIP, {
      open: (e) => {

      },
      close: (e) => {
      }
    });
    return this.localSocket;
  }
  
  updateLocalIP(gardenIP) {
    if (!this.localSocket) return;
    this.localSocket.gardenIP = gardenIP;
  }
}
