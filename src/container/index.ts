import pino from 'pino';
import { Server as SocketIO } from 'socket.io';
import { IMediasoupConfig } from '../config/mediasoup';
import MediasoupService from '../mediasoup/service';
import RoomService from '../room/service';
import SocketService from '../socket';

export interface ICreateContainerParams {
    config: {
        mediasoup: IMediasoupConfig
    }
}

export interface IServiceContainer {
    logger: pino.Logger,
    config: {
        mediasoup: IMediasoupConfig
    },
    socketServer: SocketIO;
    services?: {
        mediasoupService: MediasoupService;
        roomService: RoomService;
        socketService: SocketService;
    }
}

async function createServiceContainer(
    params: ICreateContainerParams
): Promise<IServiceContainer> {
    const {
        config
    } = params;

    const logger = pino({ 
        prettyPrint: true,
        timestamp: pino.stdTimeFunctions.isoTime,
    });

    const io = new SocketIO(undefined, { cors: { origin: '*' } });

    const container: IServiceContainer = {
        logger,
        config,
        socketServer: io,
    };

    container.services = {
        mediasoupService: new MediasoupService(container),
        roomService: new RoomService(container),
        socketService: new SocketService(container),
    };

    return container;
}

export default createServiceContainer;