import { createIframe, filenameFromManifest } from '../replay.js';

describe('Replay module', () => {
  describe('creation of iframes', () => {
    it('creates an iframe', () => {
      const iframe = createIframe(
        {
          cars: [['12', 'RUN', 'Joe Bradley'], ['21', 'RUN', 'Shea Adam']],
          session: {
            flagState: 'green'
          },
          messages: []
        },
        {
          cars: [['12', 'RUN', 'Joe Bradley'], ['21', 'PIT', 'Shea Adam']],
          session: {
            flagState: 'sc'
          },
          messages: [[12345, 'foo', 'bar']]
        }
      );

      expect(iframe.cars.length).toEqual(1);
      expect(iframe.cars[0]).toEqual(['change', [1, 1], ['RUN', 'PIT']]);

      expect(iframe.session.length).toEqual(1);
      expect(iframe.session[0]).toEqual(['change', 'flagState', ['green', 'sc']]);

      expect(iframe.highlight).toEqual([]);

      expect(iframe.messages.length).toEqual(1);
      expect(iframe.messages[0]).toEqual([12345, 'foo', 'bar']);
    });
  });

  describe('#filenameFromManifest', () => {
    it('suggests a filename', () => {
      const manifest = {
        startTime: new Date('2025-01-31 12:34:56 +00:00').getTime() / 1000,
        name: 'Service Name',
        description: 'Description with invalid/unwanted characters'
      };

      const filename = filenameFromManifest(manifest, 'ext');
      expect(filename).toEqual('2025-01-31 12-34 Service Name - Description with invalid_unwanted characters.ext');
    });
  });
});
