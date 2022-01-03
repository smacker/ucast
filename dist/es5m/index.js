import { createInterpreter } from '@ucast/core';

var eq = function eq(condition, query) {
  return query.where(condition.field, '=', condition.value);
};
var ne = function ne(condition, query) {
  return query.where(condition.field, '<>', condition.value);
};
var lt = function lt(condition, query) {
  return query.where(condition.field, '<', condition.value);
};
var lte = function lte(condition, query) {
  return query.where(condition.field, '<=', condition.value);
};
var gt = function gt(condition, query) {
  return query.where(condition.field, '>', condition.value);
};
var gte = function gte(condition, query) {
  return query.where(condition.field, '>=', condition.value);
};
var exists = function exists(condition, query) {
  if (condition.value) {
    return query.whereRaw("attribute_exists(" + query.field(condition.field) + ")");
  }

  return query.whereRaw("attribute_not_exists(" + query.field(condition.field) + ")");
};

function manyParamsOperator(name) {
  return function (condition, query) {
    return query.whereRaw(query.field(condition.field) + " " + name + "(" + query.manyParams(condition.value).join(', ') + ")");
  };
}

var within = manyParamsOperator('IN');
var nin = manyParamsOperator('NOT IN');

function compoundOperator(combinator, isInverted) {
  if (isInverted === void 0) {
    isInverted = false;
  }

  return function (node, query, _ref) {
    var interpret = _ref.interpret;
    var childQuery = query.child();
    node.value.forEach(function (condition) {
      return interpret(condition, childQuery);
    });
    return query.merge(childQuery, combinator, isInverted);
  };
}

var not = compoundOperator('AND', true);
var and = compoundOperator('AND');
var or = compoundOperator('OR');
var nor = compoundOperator('OR', true);

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

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var Query = /*#__PURE__*/function () {
  function Query() {
    this._expressions = [];
    this._names = {};
    this._values = {};
    this._placeholderString = 'p';
    this._lastPlaceholderIndex = 1;
  }

  var _proto = Query.prototype;

  _proto.field = function field(rawName) {
    var _this = this;

    // support fields with the dot in name (escaped like 'a\\.b')
    // and use placeholders to avoid conflicts with reserved words
    //
    // javascript doesn't support lookbehind, so reverse the string and use lookahead
    var names = rawName.split('').reverse().join('').split(/\.(?!\\)/).reverse().map(function (v) {
      return v.split('').reverse().join('');
    });
    var keys = names.map(function (part) {
      return ("#" + part).replace(/\\\./g, '_');
    });
    keys.forEach(function (key, i) {
      _this._names[key.replace(/\[\d+\]/g, '')] = names[i].replace(/\\\./g, '.').replace(/\[\d+\]/g, '');
    });
    return keys.join('.');
  };

  _proto.param = function param(value) {
    var idx = this._lastPlaceholderIndex + Object.keys(this._values).length;
    var key = ":" + this._placeholderString + idx;
    this._values[key] = value;
    return key;
  };

  _proto.manyParams = function manyParams(items) {
    var _this2 = this;

    return items.map(function (value) {
      return _this2.param(value);
    });
  };

  _proto.child = function child() {
    var query = new Query();
    query._lastPlaceholderIndex = this._lastPlaceholderIndex + Object.keys(this._values).length;
    return query;
  };

  _proto.where = function where(field, operator, value) {
    var expression = this.field(field) + " " + operator + " " + this.param(value);
    return this.whereRaw(expression);
  };

  _proto.whereRaw = function whereRaw(expression) {
    this._expressions.push(expression);

    return this;
  };

  _proto.merge = function merge(query, operator, isInverted) {
    if (operator === void 0) {
      operator = 'AND';
    }

    if (isInverted === void 0) {
      isInverted = false;
    }

    var expression = query._expressions.join(" " + operator + " ");

    if (expression[0] !== '(') {
      expression = "(" + expression + ")";
    }

    this._expressions.push("" + (isInverted ? 'NOT ' : '') + expression);

    this._names = _extends({}, this._names, query._names);
    this._values = _extends({}, this._values, query._values);
    return this;
  };

  _proto.toJSON = function toJSON() {
    return [this._expressions.join(' AND '), this._names, this._values];
  };

  return Query;
}();
function createDynamoInterpreter(operators) {
  var interpret = createInterpreter(operators);
  return function (condition) {
    return interpret(condition, new Query()).toJSON();
  };
}

var allInterpreters = _extends({}, interpreters, {
  in: within
});

export { Query, allInterpreters, and, createDynamoInterpreter, eq, exists, gt, gte, lt, lte, ne, nin, nor, not, or, within };
//# sourceMappingURL=index.js.map
