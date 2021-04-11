declare const logCreator: () => ({ label, log: { message, ...extra } }: any) => void;
export default logCreator;
