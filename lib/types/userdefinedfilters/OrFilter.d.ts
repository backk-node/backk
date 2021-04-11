export default class OrFilter {
    fieldName: string;
    fieldFunction?: 'ABS' | 'CEILING' | 'FLOOR' | 'ROUND' | 'LENGTH' | 'LOWER' | 'LTRIM' | 'RTRIM' | 'TRIM' | 'UPPER' | 'DAY' | 'HOUR' | 'MINUTE' | 'MONTH' | 'QUARTER' | 'SECOND' | 'WEEK' | 'WEEKDAY' | 'YEAR';
    operator?: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'NOT IN' | 'LIKE' | 'NOT LIKE' | 'IS NULL' | 'IS NOT NULL' | 'OR';
    value: any;
}
