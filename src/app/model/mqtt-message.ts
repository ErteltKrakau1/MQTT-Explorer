export interface MqttMessage {
  id : string;
  topic : string;
  client : string;
  payload : string;
  timestamp : number;
}
