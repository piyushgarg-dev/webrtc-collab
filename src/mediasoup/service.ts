import { createWorker, types as mediasoupTypes, types } from 'mediasoup';
import { IServiceContainer } from '../container';

type WorkerId = number;
type RouterId = string;

class MediasoupService {
    private _container: IServiceContainer;

    private _workerMap: Map<WorkerId, mediasoupTypes.Worker>;

    private _routerMap: Map<RouterId, mediasoupTypes.Router>;

    private _workerIds: Array<number>;

    private _currentWorkerIndex: number;

    constructor(container: IServiceContainer) {
        this._container = container;
        this._workerMap = new Map<WorkerId, mediasoupTypes.Worker>();
        this._routerMap = new Map<RouterId, mediasoupTypes.Router>();
        this._workerIds = [];
        this._currentWorkerIndex = 0;
    }

    private getWorker(): mediasoupTypes.Worker {
        const { _currentWorkerIndex, _container } = this;
        const { config: { mediasoup } } = _container;

        if (_currentWorkerIndex === ( mediasoup.totalWorkers - 1 )) {
            this._currentWorkerIndex = 0;
        }

        const workerId: number = this._workerIds[_currentWorkerIndex];
        const worker: mediasoupTypes.Worker | undefined = this._workerMap.get(workerId);
        if (!worker) throw new Error('cannot get mediasoup worker');

        return worker;
    }

    async setup(): Promise<void> {
        const { logger, config } = this._container;
        const { mediasoup: mediasoupConfig } = config;
        logger.info(`creating mediasoup workers...`);

        const workersPromise: Promise<mediasoupTypes.Worker>[] = [];
        for (let i = 0; i < mediasoupConfig.totalWorkers; i++) {
            workersPromise.push(createWorker(mediasoupConfig.worker));
        }

        const workers = await Promise.all(workersPromise);
        logger.info(`mediasoup workers created | total: ${mediasoupConfig.totalWorkers}`);
        workers.forEach((worker) => {
            this._workerMap.set(worker.pid, worker);
            this._workerIds.push(worker.pid);
        });
        
        return;
    }

    async createRouter(): Promise<mediasoupTypes.Router> {
        const { config } = this._container;
        const worker: mediasoupTypes.Worker = this.getWorker();
        const router: mediasoupTypes.Router = await worker.createRouter(config.mediasoup.router);
        this._routerMap.set(router.id, router);

        return router;
    }
}

export default MediasoupService;