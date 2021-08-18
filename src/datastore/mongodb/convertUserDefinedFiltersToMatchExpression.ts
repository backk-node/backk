import UserDefinedFilter from '../../types/userdefinedfilters/UserDefinedFilter';

function convertSqlLikeExpressionToRegExp(likeExpression: string, isCaseSensitive = false) {
  return new RegExp(
    `^${likeExpression
      .split(/(\[.+?])/g)
      .map((s, i) =>
        i % 2
          ? s.replace(/\\/g, '\\\\')
          : s.replace(/[-/\\^$*+?.()|[\]{}%_]/g, (m) => {
              switch (m) {
                case '%':
                  return '.*';
                case '_':
                  return '.';
                default:
                  return `\\${m}`;
              }
            })
      )
      .join('')}$`,
    isCaseSensitive ? '' : 'i'
  );
}

function getWhereExpression(userDefinedFilter: UserDefinedFilter) {
  let exprLeftHandSide: string;

  if (!userDefinedFilter.fieldName) {
    return {};
  }

  switch (userDefinedFilter.fieldFunction) {
    case 'ABS':
      exprLeftHandSide = `Math.abs(this.${userDefinedFilter.fieldName})`;
      break;
    case 'CEILING':
      exprLeftHandSide = `Math.ceil(this.${userDefinedFilter.fieldName})`;
      break;
    case 'FLOOR':
      exprLeftHandSide = `Math.floor(this.${userDefinedFilter.fieldName})`;
      break;
    case 'ROUND':
      exprLeftHandSide = `Math.round(this.${userDefinedFilter.fieldName})`;
      break;
    case 'LENGTH':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.length`;
      break;
    case 'LOWER':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.toLowerCase()`;
      break;
    case 'LTRIM':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.trimStart()`;
      break;
    case 'RTRIM':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.trimEnd()`;
      break;
    case 'TRIM':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.trim()`;
      break;
    case 'UPPER':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.toUpperCase()`;
      break;
    case 'DAY':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.getDay()`;
      break;
    case 'HOUR':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.getHours()`;
      break;
    case 'MINUTE':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.getMinutes()`;
      break;
    case 'MONTH':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.getMonth()`;
      break;
    case 'QUARTER':
      exprLeftHandSide = `Math.ceil((this.${userDefinedFilter.fieldName}.getMonth() + 1) / 3)`;
      break;
    case 'SECOND':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.getSeconds()`;
      break;
    case 'WEEK':
      throw new Error('Field function WEEK not supported in user defined filters');
    case 'WEEKDAY':
      throw new Error('Field function WEEKDAY not supported in user defined filters');
    case 'YEAR':
      exprLeftHandSide = `this.${userDefinedFilter.fieldName}.getFullYear()`;
      break;
    default:
      exprLeftHandSide = '';
  }

  switch (userDefinedFilter.operator) {
    case '=':
      return {
        $where: `function() {
          return ${exprLeftHandSide} === ${userDefinedFilter.value};
        }`
      };
    case '!=':
      return {
        $where: `function() {
          return ${exprLeftHandSide} !== ${userDefinedFilter.value};
        }`
      };
    case '>':
      return {
        $where: `function() {
          return ${exprLeftHandSide} > ${userDefinedFilter.value};
        }`
      };
    case '<':
      return {
        $where: `function() {
          return ${exprLeftHandSide} < ${userDefinedFilter.value};
        }`
      };
    case '>=':
      return {
        $where: `function() {
          return ${exprLeftHandSide} >= ${userDefinedFilter.value};
        }`
      };
    case '<=':
      return {
        $where: `function() {
          return ${exprLeftHandSide} <= ${userDefinedFilter.value};
        }`
      };
    case 'IN':
      return {
        [userDefinedFilter.fieldName]: {
          $in: userDefinedFilter.value.map((v: any) => {
            return {
              $where: `function() {
                  return ${exprLeftHandSide} == ${v};
                }`
            };
          })
        }
      };
    case 'NOT IN':
      return {
        [userDefinedFilter.fieldName]: {
          $nin: userDefinedFilter.value.map((v: any) => {
            return {
              $where: `function() {
                  return ${exprLeftHandSide} == ${v};
                }`
            };
          })
        }
      };
    case 'LIKE':
      return {
        $where: `function() {
            return ${exprLeftHandSide}.match(${userDefinedFilter.value});
          }`
      };
    case 'NOT LIKE':
      return {
        $where: `function() {
          return !${exprLeftHandSide}.match(${userDefinedFilter.value});
        }`
      };
    case 'IS NULL':
      return {
        $where: `function() {
          return ${exprLeftHandSide} === null;
        }`
      };
    case 'IS NOT NULL':
      return {
        $where: `function() {
          return ${exprLeftHandSide} !== null;
        }`
      };
  }
}

export default function convertUserDefinedFiltersToMatchExpression(
  userDefinedFilters: UserDefinedFilter[]
): object {
  return userDefinedFilters.reduce((matchExpressions, userDefinedFilter) => {
    if (userDefinedFilter.operator === 'OR' && userDefinedFilter.orFilters) {
      return {
        $or: userDefinedFilter.orFilters.map((orFilter) =>
          convertUserDefinedFiltersToMatchExpression([orFilter])
        )
      };
    }

    if (!userDefinedFilter.fieldName) {
      throw new Error('fieldName is not defined for user defined filter');
    }

    let matchExpression;

    if (userDefinedFilter.fieldFunction) {
      matchExpression = getWhereExpression(userDefinedFilter);
    } else if (userDefinedFilter.operator === '=') {
      matchExpression = { [userDefinedFilter.fieldName]: userDefinedFilter.value };
    } else if (userDefinedFilter.operator === '!=') {
      matchExpression = { [userDefinedFilter.fieldName]: { $ne: userDefinedFilter.value } };
    } else if (userDefinedFilter.operator === '>') {
      matchExpression = { [userDefinedFilter.fieldName]: { $gt: userDefinedFilter.value } };
    } else if (userDefinedFilter.operator === '<') {
      matchExpression = { [userDefinedFilter.fieldName]: { $lt: userDefinedFilter.value } };
    } else if (userDefinedFilter.operator === '>=') {
      matchExpression = { [userDefinedFilter.fieldName]: { $gte: userDefinedFilter.value } };
    } else if (userDefinedFilter.operator === '<=') {
      matchExpression = { [userDefinedFilter.fieldName]: { $lte: userDefinedFilter.value } };
    } else if (userDefinedFilter.operator === 'IN') {
      matchExpression = { [userDefinedFilter.fieldName]: { $in: userDefinedFilter.value } };
    } else if (userDefinedFilter.operator === 'NOT IN') {
      matchExpression = { [userDefinedFilter.fieldName]: { $nin: userDefinedFilter.value } };
    } else if (userDefinedFilter.operator === 'LIKE') {
      const regExp = convertSqlLikeExpressionToRegExp(userDefinedFilter.value);
      matchExpression = { [userDefinedFilter.fieldName]: regExp };
    } else if (userDefinedFilter.operator === 'NOT LIKE') {
      const regExp = convertSqlLikeExpressionToRegExp(userDefinedFilter.value);
      matchExpression = { [userDefinedFilter.fieldName]: { $not: regExp } };
    } else if (userDefinedFilter.operator === 'IS NULL') {
      matchExpression = { [userDefinedFilter.fieldName]: null };
    } else if (userDefinedFilter.operator === 'IS NOT NULL') {
      matchExpression = { [userDefinedFilter.fieldName]: { $ne: null } };
    }

    return {
      ...matchExpressions,
      ...matchExpression
    };
  }, {});
}
