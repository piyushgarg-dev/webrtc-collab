import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { IServiceContainer } from '../container';
import AppError from '../error/AppError';

import * as roomRoute from './room';

export class App {
    private _app: Application;

    constructor(app: Application) {
        this._app = app;
    }

    get callback(): Application {
        return this._app;
    }
}

export async function createApplication(_container: IServiceContainer): Promise<App> {
    const server: Application = express();
    const app: App = new App(server);

    server.use(express.json());
    server.use(cors());
    server.use(express.static(path.resolve('./public')));

    _container.services?.socketService.setup();

    roomRoute.init(server, _container, { prefix: '/api/room' });

    server.use((error: AppError | Error, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof AppError) {
            return res.json(error.format());

        } else {
            _container.logger.error('Internal Server Error...');
            _container.logger.error(error);

            return res.status(500).json({ 
                error: {
                    code: 500,
                    message: 'Internal server error',
                } 
            });
        }
    });
    return app;
}