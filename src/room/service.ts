import { types } from 'mediasoup';
import { IServiceContainer } from "../container";
import AppError from "../error/AppError";
import Room, { Peer } from './room';

type RoomId = string;

class RoomService {
    private _container: IServiceContainer;

    private _roomMap: Map<RoomId, Room>;

    private _roomRouter: Map<RoomId, types.Router>;

    private _transportMaps: Map<string, types.Transport>;

    private _producerTransport: types.Producer | undefined;

    constructor(container: IServiceContainer) {
        this._container = container;
        this._roomMap = new Map<RoomId, Room>();
        this._roomRouter = new Map<RoomId, types.Router>();
        this._transportMaps = new Map<string, types.Transport>();
    }

    public async createRoom(roomId: RoomId, producer: Peer): Promise<Room> {
        if (!this._container.services) throw new Error('services not init..');
        if (this._roomMap.has(roomId)) throw new AppError(400, `Room ${roomId} already exsists`);
        const room = new Room(roomId, producer);
        const router = await this._container.services?.mediasoupService.createRouter();
        this._roomRouter.set(roomId, router);
        this._roomMap.set(roomId, room);
        return room;
    }

    public joinPeer(roomId: RoomId, peer: Peer) {
        const room = this._roomMap.get(roomId);
        if (!room) throw new AppError(400, `Room ${roomId} does not exsists`);
        if (room.getPeer(peer.email)) throw new AppError(400, `Peer already in room`);
        room.addPeer(peer);

        return room;

    }

    public getRoomRouter(roomId: string): types.Router {
        const router = this._roomRouter.get(roomId);
        if (!router) throw new AppError(400, `Room ${roomId} does not exsists.`);
        return router;
    }

    public async createRtcTransport(roomId: string): Promise<types.Transport> {
        const router = this._roomRouter.get(roomId);
        if (!router) throw new AppError(400, `Room ${roomId} does not exsists.`);
        const { config: { mediasoup } } = this._container;
        const transport = await router.createWebRtcTransport(mediasoup.transport);
        this._transportMaps.set(transport.id, transport);

        return transport;
    }

    public async connectTransport(id: string, dtls: types.DtlsParameters): Promise<void> {
        const transport = this._transportMaps.get(id)
        if (!transport) throw new AppError(400, "Transport does not exsist");
        await transport.connect({ dtlsParameters: dtls });
    }

    public async produceTransport(id: string, payload: { id: string, kind: types.MediaKind, rtpParameters: types.RtpParameters }) {
        const transport = this._transportMaps.get(id)
        if (!transport) throw new AppError(400, "Transport does not exsist");
        const { id: transportId, kind, rtpParameters } = payload;
        const producer = await transport.produce({ id: transportId, kind, rtpParameters });
        this._producerTransport = producer;
        return producer;
    }

    public async createConsumerTransport(
        roomId: string, 
        payload: { rtpCapabilities: types.RtpCapabilities}
        ) {
        const router = this._roomRouter.get(roomId);
        if (!router) throw new AppError(400, `Room ${roomId} does not exsists.`);

        const { config: { mediasoup } } = this._container;
        const transport = await router.createWebRtcTransport(mediasoup.transport);
        this._transportMaps.set(transport.id, transport);

        const producer = this._producerTransport;
        if (!producer) throw new AppError(400, "No producer found");

        const { rtpCapabilities } = payload;
        if (router.canConsume({ producerId: producer.id, rtpCapabilities })) {
            const consumer = await transport.consume({ producerId: producer.id, rtpCapabilities });
            return { consumer, transport };
        } else throw new AppError(400, "Can't consume");

    }

    public async getRoomProducer() {
        return this._producerTransport;
    }
}

export default RoomService;