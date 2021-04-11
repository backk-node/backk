export default class SortBy {
    constructor(subEntityPath: string, fieldName: string, sortDirection: 'ASC' | 'DESC');
    subEntityPath?: string;
    fieldName: string;
    sortDirection: 'ASC' | 'DESC';
}
