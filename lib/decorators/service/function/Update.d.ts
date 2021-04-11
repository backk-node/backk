export declare type UpdateType = 'update' | 'addOrRemove';
export declare function Update(updateType: UpdateType): (object: Object, functionName: string) => void;
