import { Request, Response, NextFunction } from 'express';
import { IServiceContainer } from "../../container";
import AppError from '../../error/AppError';
import PermissionError from '../../error/PermissionError';

class RoomController {
    private _container: IServiceContainer;

    constructor(container: IServiceContainer) {
        this._container = container;
    }

    async createRoom(req: Request, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const { name, email } = req.body;
        const { services } = this._container;
        try {
            if (!services) throw new Error("Services not started");
            if (!name || !email) throw new PermissionError();

            const room = await services.roomService.createRoom(roomId, { name, email, type: 'producer' });
            return res.status(200).json({
                room: {
                    id: room.id,
                    createdBy: {
                        name,
                        email
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    async joinRoom(req: Request, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const { name, email } = req.body;
        const { services } = this._container;

        try {
            if (!services) throw new Error("Services not started");
            if (!name || !email) throw new PermissionError();

            const room = services.roomService.joinPeer(roomId, { name, email, type: 'consumer' });
            return res.status(200).json({
                room: {
                    id: room.id,
                    createdBy: {
                        name: room.createdBy.name,
                        email: room.createdBy.email
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    async getRtpCapabilities(req: Request, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const { services } = this._container;

        try {
            if (!services) throw new Error("Services not started");
            const router = services.roomService.getRoomRouter(roomId);

            const rtpCapabilities = router.rtpCapabilities;

            return res.status(200).json({ rtpCapabilities });
            
        } catch (error) {
            next(error);
        }
    }

    async createRtcTransport(req: Request, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const { services } = this._container;

        try {
            if (!services) throw new Error("Services not started");
            const transport = await services.roomService.createRtcTransport(roomId);

            return res.status(200).json({ transport });
        } catch (error) {
            next(error);
        }
    }

    async connectTransport(req: Request, res: Response, next: NextFunction) {
        const { transportId } = req.params;
        const { dtlsParameters } = req.body;
        const { services } = this._container;

        try {
            if (!services) throw new Error("Services not started");
            await services.roomService.connectTransport(transportId, dtlsParameters);

            return res.status(200).json({ message: 'success' });
        } catch (error) {
            next(error);
        }
        
    }

    async produceTransport(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { transportId, kind, rtpParameters } = req.body;
        const { services } = this._container;
        try {
            if (!services) throw new Error("Services not started");
            const producer = await services.roomService.produceTransport(id, { id: transportId, kind, rtpParameters });

            return res.status(200).json({ message: 'success', producer });
            
        } catch (error) {
            next(error);
        }
    }

    async createConsumerTransport(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { rtpCapabilities } = req.body;
        const { services } = this._container;

        try {
            if (!services) throw new Error("Services not started");
            const { transport, consumer } = await services.roomService.createConsumerTransport(id, { rtpCapabilities });

            return res.status(200).json({ transport, consumer });
        } catch (error) {
            next(error);
        }
    }
}

export default RoomController;