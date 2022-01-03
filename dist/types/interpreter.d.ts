import { Condition, InterpretationContext } from '@ucast/core';
export declare class Query {
    private _expressions;
    private _names;
    private _values;
    private _placeholderString;
    private _lastPlaceholderIndex;
    field(rawName: string): string;
    param(value: unknown): string;
    manyParams(items: unknown[]): string[];
    child(): Query;
    where(field: string, operator: string, value: unknown): this;
    whereRaw(expression: string): this;
    merge(query: Query, operator?: 'AND' | 'OR', isInverted?: boolean): this;
    toJSON(): [string, Record<string, string>, Record<string, unknown>];
}
export declare type DynamoOperator<C extends Condition> = (condition: C, query: Query, context: InterpretationContext<DynamoOperator<C>>) => Query;
export declare function createDynamoInterpreter(operators: Record<string, DynamoOperator<any>>): (condition: Condition) => [string, Record<string, string>, Record<string, unknown>];
