export declare type UpdateType = 'update' | 'addOrRemove';
export default function Update(updateType: UpdateType): (object: Object, functionName: string) => void;
