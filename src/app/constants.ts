
export const WS_EVENTS = {
  connection: 'connection',
  disconnect: 'disconnect',
  message: 'message',
  environment: 'environment',

  cloudConnect: 'connect', // For Socket.IO-Client

  // Garden <-> Cloud <-> Mobile
  gardenConnect: 'gardenConnect',
  garden2Cloud: 'garden2cloud',
  garden2Mobile: 'garden2mobile',

  mobileConnect: 'mobileConnect',
  mobile2Cloud: 'mobile2cloud',
  mobile2Garden: 'mobile2cloud',
  
  // Command send to stations in the local garden
  command: 'command',

  // Station <-> Garden
  stationConnect: 'stationConnect',
  station2Garden: 'station2garden',
  garden2Station: 'garden2station'
};

export const Config = {
  AuthEndpoint: 'http://localhost:5000/apis/auth',
  GardenEndpoint: 'http://localhost:5000/apis/garden',
  // AuthEndpoint: 'https://cloud-smart-garden.herokuapp.com/apis/auth',
  // GardenEndpoint: 'https://cloud-smart-garden.herokuapp.com/apis/garden',
  wsEndPoint: "ws://localhost:5000"
}


