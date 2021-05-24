import http from 'http';
import createServiceContainer, { IServiceContainer } from './container';
import { createApplication, App } from './app';

import * as config from './config';

async function init() {
    const container: IServiceContainer = await createServiceContainer({
        config: {
            mediasoup: config.mediasoupConfig,
        }
    });
    const { logger } = container;

    try {
        const application: App = await createApplication(container);
        const server: http.Server = http.createServer(application.callback);
        const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

        await container.services?.mediasoupService.setup();
        container.socketServer.attach(server);

        server.listen(PORT, () => logger.info(`Server started at PORT:${PORT}`));
        logger.info(`using environment: ${process.env.NODE_ENV}`);
    } catch (error) {
        logger.error(`Error occured while starting server: ${error}`);
        process.exit(1);
    }
}

init();