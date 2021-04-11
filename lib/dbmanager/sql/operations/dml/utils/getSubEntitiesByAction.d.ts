export default function getSubEntitiesByAction<T extends {
    id: string;
}>(newSubEntities: T[], currentSubEntities: T[]): {
    subEntitiesToAdd: T[];
    subEntitiesToDelete: T[];
    subEntitiesToUpdate: T[];
};
