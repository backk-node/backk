"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultPrometheusMeter_1 = __importStar(require("./defaultPrometheusMeter"));
const fs = __importStar(require("fs"));
const perf_hooks = __importStar(require("perf_hooks"));
class DefaultSystemAndNodeJsMetrics {
    constructor(meter) {
        this.meter = meter;
        this.garbageCollectionDurationBucketCounter = this.meter.createCounter(`garbage_collection_event_count`, {
            description: 'Garbage collection event count'
        });
    }
    startCollectingMetrics() {
        const labels = { pid: process.pid.toString() };
        const processStartTimestampSinceEpochInSecs = Math.round(Date.now() / 1000 - process.uptime());
        this.meter.createValueObserver('process_start_timestamp_since_epoch_in_seconds', {
            description: 'Process start timestamp since epoch in seconds'
        }, (valueObserver) => {
            valueObserver.observe(processStartTimestampSinceEpochInSecs, labels);
        });
        if (typeof process._getActiveRequests === 'function' && Array.isArray(process._getActiveRequests())) {
            this.meter.createValueObserver('process_active_requests_total_count', {
                description: "Total count of process's active requests"
            }, (valueObserver) => {
                valueObserver.observe(process._getActiveRequests().length, labels);
            });
        }
        if (process.platform === 'linux') {
            this.meter.createValueObserver('process_open_file_descriptors_count', {
                description: "Count of process's open file descriptors"
            }, (valueObserver) => {
                try {
                    const fileDescriptors = fs.readdirSync('/proc/self/fd');
                    valueObserver.observe(fileDescriptors.length - 1, labels);
                }
                catch {
                }
            });
        }
        if (typeof process._getActiveHandles === 'function' && Array.isArray(process._getActiveHandles())) {
            this.meter.createValueObserver('process_active_handles_total_count', {
                description: "Total count of process's active handles"
            }, (valueObserver) => {
                valueObserver.observe(process._getActiveHandles().length, labels);
            });
        }
        let previousCpuUsage;
        this.meter.createValueObserver('process_cpu_usage_percentage', {
            description: 'CPU usage percentage of process'
        }, (valueObserver) => {
            const cpuUsage = process.cpuUsage(previousCpuUsage);
            const totalCpuUsageInMillis = (cpuUsage.user + cpuUsage.system) / 1000;
            valueObserver.observe((totalCpuUsageInMillis / defaultPrometheusMeter_1.DEFAULT_METER_INTERVAL_IN_MILLIS) * 100, labels);
            previousCpuUsage = cpuUsage;
        });
        if (process.platform === 'linux') {
            this.meter.createValueObserver('container_memory_usage_megabytes', {
                description: 'Container memory usage in megabytes'
            }, (valueObserver) => {
                try {
                    const memoryUsageInBytesStr = fs.readFileSync('/sys/fs/cgroup/memory/memory.usage_in_bytes', {
                        encoding: 'UTF-8'
                    });
                    const memoryUsageInMegaBytes = parseInt(memoryUsageInBytesStr, 10) / (1024 * 1024);
                    valueObserver.observe(memoryUsageInMegaBytes, labels);
                }
                catch {
                }
            });
        }
        if (process.platform === 'linux') {
            this.meter.createValueObserver('container_memory_limit_megabytes', {
                description: 'Container memory limit in megabytes'
            }, (valueObserver) => {
                try {
                    const memoryLimitInBytesStr = fs.readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', {
                        encoding: 'UTF-8'
                    });
                    const memoryLimitInMegaBytes = parseInt(memoryLimitInBytesStr, 10) / (1024 * 1024);
                    valueObserver.observe(memoryLimitInMegaBytes, labels);
                }
                catch {
                }
            });
        }
        const gcKindToTypeMap = {};
        gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR.toString()] = 'major';
        gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR.toString()] = 'minor';
        gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL.toString()] = 'incremental';
        gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB.toString()] = 'weakcb';
        const gcDurationInSecsBuckets = [0.001, 0.01, 0.1, 1, 2, 5, Number.POSITIVE_INFINITY];
        const garbageCollectionObserver = new perf_hooks.PerformanceObserver((list) => {
            const { kind, duration } = list.getEntries()[0];
            const durationInSecs = duration / 1000;
            const foundGcDurationBucket = gcDurationInSecsBuckets.find((gcDurationBucket) => durationInSecs <= gcDurationBucket);
            const gcType = gcKindToTypeMap[kind.toString()];
            this.garbageCollectionDurationBucketCounter
                .bind({ ...labels, gcType, gcDurationBucket: foundGcDurationBucket.toString() })
                .add(1);
        });
        garbageCollectionObserver.observe({ entryTypes: ['gc'], buffered: false });
    }
}
exports.default = new DefaultSystemAndNodeJsMetrics(defaultPrometheusMeter_1.default);
//# sourceMappingURL=defaultSystemAndNodeJsMetrics.js.map