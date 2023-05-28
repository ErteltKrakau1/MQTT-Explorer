export interface MqttMessage {
  topic : string;
  client : string;
  payload : string;
  timestamp : number;
}
