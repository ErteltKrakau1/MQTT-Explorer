import { MqttMessage } from './mqtt-message';

describe('MqttMessage', () => {
  it('should create an instance', () => {
    expect(new MqttMessage()).toBeTruthy();
  });
});
