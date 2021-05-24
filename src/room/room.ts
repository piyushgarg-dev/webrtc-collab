import AppError from "../error/AppError";

type Peertype = "producer" | "consumer";

export interface Peer {
    name: string;
    email: string;
    type: Peertype;
}

type RoomId = string;

class Room {
    private _id: RoomId;

    private _peerMap: Map<string, Peer>;

    private _producer: Peer;

    constructor(id: RoomId, producer: Peer) {
        this._id = id;
        this._producer = producer;
        this._peerMap = new Map<string, Peer>();
    }

    getPeer(email: string) {
        return this._peerMap.get(email);
    }

    addPeer(peer: Peer): void {
        this._peerMap.set(peer.email, peer);
        return;
    }

    get id(): RoomId {
        return this._id;
    }

    get createdBy() {
        return this._producer;
    }
}

export default Room;