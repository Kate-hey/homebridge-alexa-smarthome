import * as O from 'fp-ts/Option';
import { Option } from 'fp-ts/Option';
import { LazyArg } from 'fp-ts/lib/function';
import { Nullable } from '../domain';
export declare const getOrElse: <T>(opt: O.Option<T>, onNone: LazyArg<T>) => T;
export declare const getOrElseNullable: <T>(nullable: Nullable<T>, onNone: LazyArg<T>) => T;
export declare const matchNullable: <A, B>(nullable: Nullable<A>, onNone: LazyArg<B>, onSome: (some: A) => B) => B;
//# sourceMappingURL=fp-util.d.ts.map