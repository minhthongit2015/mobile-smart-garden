
export class SmartGardenWebSocket {
  public ws: WebSocket;
  public gardenIP: string;
  public listeners: any;
  public sendQueue: any[];
  public autoReconnect: boolean;

  constructor(gardenIP: string, listeners: object = null) {
    this.gardenIP = gardenIP;
    this.listeners = {};
    this.sendQueue = [];
    this.autoReconnect = true;
    
    this.connect();
    this.attachEventListeners(listeners);
  }

  get readyState() { return this.ws.readyState }
  get isConnecting() { return this.ws.readyState == WebSocket.CONNECTING }
  get isOpen() { return this.ws.readyState == WebSocket.OPEN }
  get isConnected() { return this.isOpen }
  get isClosing() { return this.ws.readyState == WebSocket.CLOSING }
  get isClosed() { return this.ws.readyState == WebSocket.CLOSED }

  connect() {
    this.autoReconnect = true;
    this.ws = new WebSocket(`ws://${this.gardenIP}`);
    this.setupBaseListener(this.ws);
  }
  reconnect() {
    this.autoReconnect = true;
    this.ws = new WebSocket(`ws://${this.gardenIP}`);
    this.setupBaseListener(this.ws);
    this.restoreListeners(this.ws);
  }

  close(code?: number, reason?: string) {
    this.autoReconnect = false;
    if (this.isOpen || this.isConnecting)
      this.ws.close(code, reason);
  }



  /*******************************************************************
   *                            Listeners                            *
   *******************************************************************/
  saveListener(type, listener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }
  removeListener(type, listener) {
    if (!this.listeners[type]) return;
    let listenerIndex = this.listeners[type].indexOf(listener);
    if (listenerIndex >= 0)
      this.listeners[type].splice(listenerIndex, 1);
  }
  clearListener(type) {
    if (!this.listeners[type]) return;
    for (let listener of this.listeners[type])
      this.ws.removeEventListener(type, listener);
    this.listeners[type] = [];
  }
  restoreListeners(ws) {
    let listeners = this.listeners;
    for (let event in listeners) {
      for(let listener of listeners[event]) {
        ws.addEventListener(event, (evt) => listener(evt));
      }
    }
  }

  setupBaseListener(ws: WebSocket) {
    ws.addEventListener("open", (evt) => {
      console.log("<*> Local Connection Opened!");
      let data;
      while (data = this.sendQueue.shift()) {
        this.send(data);
      }
    });
    
    ws.addEventListener("message", (evt) => {
      // console.log("RecvMessage");
    });
    
    ws.addEventListener("close", (evt) => {
      console.log("</> Local Connection Closed!");
      if (this.autoReconnect) this.reconnect();
    });
    
    ws.addEventListener("error", (evt) => {
      console.log("<!> Local Connection Error!");
    });
  }

  addEventListener( type: "close" | "error" | "message" | "open",
                    listener: (this: WebSocket, ev: CloseEvent | Event | MessageEvent) => any,
                    options?: boolean | AddEventListenerOptions) {
    this.ws.addEventListener(type, listener, options);
    this.saveListener(type, listener);
  }

  removeEventListener(  type: "close" | "error" | "message" | "open",
                        listener: (this: WebSocket, ev: CloseEvent | Event | MessageEvent) => any,
                        options?: boolean | EventListenerOptions) {
    this.ws.removeEventListener(type, listener, options);
    this.removeListener(type, listener);
  }

  attachEventListeners(listeners: any) {
    if (!listeners) return;
    for (let event in listeners) {
      this.ws.addEventListener(event, (evt) => listeners[event](evt));
      this.saveListener(event, listeners[event]);
    }
  }

  send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
    if (!this.isOpen) {
      this.sendQueue.push(data);
    } else {
      this.ws.send(data);
    }
  }
}