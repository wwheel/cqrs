import { ModuleWithProviders, NgModule } from '@angular/core';
import { QueryBus } from './query-bus';
import { ActionBus } from './action-bus';
import { CqrsLoader } from './cqrs-loader';
import { CqrsModuleOptions } from './interfaces/module-options';
import { CQRS_MODULE_LOGGING, CQRS_MODULE_REGISTRY, CQRS_MODULE_SAGAS } from './tokens';
import { Logger } from './services/logger';

@NgModule()
export class CqrsModule
{
    static forRoot(options: CqrsModuleOptions): ModuleWithProviders<CqrsModule>
    {
        options = options || { sagas: [], registry: [] };

        return {
            ngModule : CqrsModule,
            providers: [
                QueryBus,
                ActionBus,
                CqrsLoader,
                Logger,
                ...options.sagas,
                {
                    provide : CQRS_MODULE_LOGGING,
                    useValue: {
                        enabled: !!options.enableLogging,
                        prefix : options.logPrefix
                    },
                },
                {
                    provide : CQRS_MODULE_REGISTRY,
                    useValue: options.registry || [],
                },
                {
                    provide   : CQRS_MODULE_SAGAS,
                    deps      : options.sagas,
                    useFactory: CqrsModule.createSourceInstances,
                },
            ],
        };
    }

    private static createSourceInstances(...instances: any[]): any[]
    {
        return instances;
    }
}
