import log, { severityNameToSeverityMap } from "../../../observability/logging/log";

const logCreator = () => ({ label, log: { message, ...extra } }: any) =>
  log(severityNameToSeverityMap[label], message, '', extra);

export default logCreator;
