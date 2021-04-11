export default function getFieldOrdering(EntityClass: new () => any): {
    $replaceRoot: {
        newRoot: {};
    };
};
