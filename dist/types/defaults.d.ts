export declare const allInterpreters: {
    in: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<unknown[]>>;
    eq: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<unknown>>;
    ne: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<unknown>>;
    lt: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<string | number | Date>>;
    lte: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<string | number | Date>>;
    gt: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<string | number | Date>>;
    gte: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<string | number | Date>>;
    exists: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<string | number | Date>>;
    within: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<unknown[]>>;
    nin: import("./interpreter").DynamoOperator<import("@ucast/core").FieldCondition<unknown[]>>;
    not: import("./interpreter").DynamoOperator<import("@ucast/core").CompoundCondition<import("@ucast/core").Condition<unknown>>>;
    and: import("./interpreter").DynamoOperator<import("@ucast/core").CompoundCondition<import("@ucast/core").Condition<unknown>>>;
    or: import("./interpreter").DynamoOperator<import("@ucast/core").CompoundCondition<import("@ucast/core").Condition<unknown>>>;
    nor: import("./interpreter").DynamoOperator<import("@ucast/core").CompoundCondition<import("@ucast/core").Condition<unknown>>>;
};
