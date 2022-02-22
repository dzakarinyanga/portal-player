// eslint-disable-next-line no-restricted-imports
import { ORM } from 'redux-orm';
// eslint-disable-next-line no-restricted-imports
import { IndexedModelClasses, ORMOpts } from 'redux-orm/ORM';
// eslint-disable-next-line no-restricted-imports
import { OrmSession } from 'redux-orm/Session';
import { ModelSelectorSpec } from '..';

import { ModelType as CustomModelType } from './model';
import { registerSelectors } from './selectors';

class _Orm<I> extends ORM<I> {
    override register(...models: readonly I[keyof I][]): void {
        super.register(...models);
        // register selectors
        registerSelectors(this as unknown as InstanceType<typeof Orm>);
    }
}

export const Orm = _Orm as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new <I extends IndexedModelClasses<any>>(opts?: ORMOpts<I>): _Orm<I> /*&
        OrmSession<I> */ /* & { [K in keyof I]: CustomModelType<I[K]> }*/ & {
        [K in keyof I]: ModelSelectorSpec<InstanceType<I[K]>>;
    };
};
