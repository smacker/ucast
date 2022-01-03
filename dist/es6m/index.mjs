import { createInterpreter } from '@ucast/core';

const eq = (condition, query) => {
  return query.where(condition.field, '=', condition.value);
};
const ne = (condition, query) => {
  return query.where(condition.field, '<>', condition.value);
};
const lt = (condition, query) => {
  return query.where(condition.field, '<', condition.value);
};
const lte = (condition, query) => {
  return query.where(condition.field, '<=', condition.value);
};
const gt = (condition, query) => {
  return query.where(condition.field, '>', condition.value);
};
const gte = (condition, query) => {
  return query.where(condition.field, '>=', condition.value);
};
const exists = (condition, query) => {
  if (condition.value) {
    return query.whereRaw(`attribute_exists(${query.field(condition.field)})`);
  }

  return query.whereRaw(`attribute_not_exists(${query.field(condition.field)})`);
};

function manyParamsOperator(name) {
  return (condition, query) => {
    return query.whereRaw(`${query.field(condition.field)} ${name}(${query.manyParams(condition.value).join(', ')})`);
  };
}

const within = manyParamsOperator('IN');
const nin = manyParamsOperator('NOT IN');

function compoundOperator(combinator, isInverted = false) {
  return (node, query, {
    interpret
  }) => {
    const childQuery = query.child();
    node.value.forEach(condition => interpret(condition, childQuery));
    return query.merge(childQuery, combinator, isInverted);
  };
}

const not = compoundOperator('AND', true);
const and = compoundOperator('AND');
const or = compoundOperator('OR');
const nor = compoundOperator('OR', true);

var interpreters = /*#__PURE__*/Object.freeze({
  __proto__: null,
  eq: eq,
  ne: ne,
  lt: lt,
  lte: lte,
  gt: gt,
  gte: gte,
  exists: exists,
  within: within,
  nin: nin,
  not: not,
  and: and,
  or: or,
  nor: nor
});

class Query {
  constructor() {
    this._expressions = [];
    this._names = {};
    this._values = {};
    this._placeholderString = 'p';
    this._lastPlaceholderIndex = 1;
  }

  field(rawName) {
    // support fields with the dot in name (escaped like 'a\\.b')
    // and use placeholders to avoid conflicts with reserved words
    //
    // javascript doesn't support lookbehind, so reverse the string and use lookahead
    const names = rawName.split('').reverse().join('').split(/\.(?!\\)/).reverse().map(v => v.split('').reverse().join(''));
    const keys = names.map(part => `#${part}`.replace(/\\\./g, '_'));
    keys.forEach((key, i) => {
      this._names[key.replace(/\[\d+\]/g, '')] = names[i].replace(/\\\./g, '.').replace(/\[\d+\]/g, '');
    });
    return keys.join('.');
  }

  param(value) {
    const idx = this._lastPlaceholderIndex + Object.keys(this._values).length;
    const key = `:${this._placeholderString}${idx}`;
    this._values[key] = value;
    return key;
  }

  manyParams(items) {
    return items.map(value => this.param(value));
  }

  child() {
    const query = new Query();
    query._lastPlaceholderIndex = this._lastPlaceholderIndex + Object.keys(this._values).length;
    return query;
  }

  where(field, operator, value) {
    const expression = `${this.field(field)} ${operator} ${this.param(value)}`;
    return this.whereRaw(expression);
  }

  whereRaw(expression) {
    this._expressions.push(expression);

    return this;
  }

  merge(query, operator = 'AND', isInverted = false) {
    let expression = query._expressions.join(` ${operator} `);

    if (expression[0] !== '(') {
      expression = `(${expression})`;
    }

    this._expressions.push(`${isInverted ? 'NOT ' : ''}${expression}`);

    this._names = Object.assign({}, this._names, query._names);
    this._values = Object.assign({}, this._values, query._values);
    return this;
  }

  toJSON() {
    return [this._expressions.join(' AND '), this._names, this._values];
  }

}
function createDynamoInterpreter(operators) {
  const interpret = createInterpreter(operators);
  return condition => {
    return interpret(condition, new Query()).toJSON();
  };
}

const allInterpreters = Object.assign({}, interpreters, {
  in: within
});

export { Query, allInterpreters, and, createDynamoInterpreter, eq, exists, gt, gte, lt, lte, ne, nin, nor, not, or, within };
//# sourceMappingURL=index.mjs.map
