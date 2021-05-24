import { cpus } from 'os';
import { types } from 'mediasoup';

export interface IMediasoupConfig {
    totalWorkers: number,
    worker: types.WorkerSettings;
    router: types.RouterOptions;
    transport: types.WebRtcTransportOptions;
}

export const mediasoupConfig: IMediasoupConfig = {
    totalWorkers: cpus().length,
    worker: {
        logLevel: 'warn',
        rtcMinPort: 1000,
        rtcMaxPort: 5000,
    },
    router: {
        mediaCodecs: [
            {
              kind        : "audio",
              mimeType    : "audio/opus",
              clockRate   : 48000,
              channels    : 2
            },
            {
              kind       : "video",
              mimeType   : "video/H264",
              clockRate  : 90000,
              parameters :
              {
                "packetization-mode"      : 1,
                "profile-level-id"        : "42e01f",
                "level-asymmetry-allowed" : 1
              }
            }
        ]
    },
    transport: {
      listenIps : [ { ip: "0.0.0.0", announcedIp: process.env.IP } ],
      enableUdp : true,
      enableTcp : true,
      preferUdp : true
    }
};