import { IServiceContainer } from "../container";

class SocketService {
    private _container: IServiceContainer;

    constructor(container: IServiceContainer) {
        this._container = container;
    }

    public setup() {
        const { socketServer } = this._container;
        const io = socketServer;

        io.on('connection', socket => {
            socket.on('join', roomId => {
                socket.join(roomId);
                console.log(`${socket.id} joined ${roomId}`)
            });
            
            socket.on('data', (data) => {
                const { room, code } = data;
                console.log(`${socket.id} code ${data.code}`)
                socket.broadcast.to(room).emit('code', code);
            });
        });
    }
}

export default SocketService;