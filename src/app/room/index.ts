import express, { Application } from 'express';
import { IServiceContainer } from '../../container';
import RoomController from './controller';

export interface IConfig {
    prefix?: string;
}

export async function init(
    server: Application, 
    container: IServiceContainer, 
    config?: IConfig
    ): Promise<void> {

    const { logger } = container;
    const router = express.Router();
    const roomController = new RoomController(container);

    router.post('/create/:roomId', roomController.createRoom.bind(roomController));
    router.post('/join/:roomId', roomController.joinRoom.bind(roomController));
    router.post('/transport/connect/:transportId', roomController.connectTransport.bind(roomController));
    router.post('/transport/produce/:id', roomController.produceTransport.bind(roomController));
    router.post('/transport/consume/:id', roomController.createConsumerTransport.bind(roomController));


    router.get('/rtp-capabilities/:roomId', roomController.getRtpCapabilities.bind(roomController));
    router.get('/transport/create/:roomId', roomController.createRtcTransport.bind(roomController));
    router.get('/producer/:roomId');

    const prefixPath = config?.prefix ? config.prefix : '';
    server.use(`${prefixPath}`, router);
}