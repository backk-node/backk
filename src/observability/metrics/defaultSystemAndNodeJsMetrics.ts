/* eslint-disable @typescript-eslint/camelcase */
import { Meter } from '@opentelemetry/metrics';
import defaultPrometheusMeter, { DEFAULT_METER_INTERVAL_IN_MILLIS } from './defaultPrometheusMeter';
import * as fs from 'fs';
import * as perf_hooks from 'perf_hooks';
import CpuUsage = NodeJS.CpuUsage;
import { Counter } from '@opentelemetry/api';

class DefaultSystemAndNodeJsMetrics {
  private garbageCollectionDurationBucketCounter: Counter;

  constructor(private readonly meter: Meter) {
    this.garbageCollectionDurationBucketCounter = this.meter.createCounter(`garbage_collection_event_count`, {
      description: 'Garbage collection event count'
    });
  }

  startCollectingMetrics() {
    const labels = { pid: process.pid.toString() };

    const processStartTimestampSinceEpochInSecs = Math.round(Date.now() / 1000 - process.uptime());
    this.meter.createValueObserver(
      'process_start_timestamp_since_epoch_in_seconds',
      {
        description: 'Process start timestamp since epoch in seconds'
      },
      (valueObserver) => {
        valueObserver.observe(processStartTimestampSinceEpochInSecs, labels);
      }
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (typeof process._getActiveRequests === 'function' && Array.isArray(process._getActiveRequests())) {
      this.meter.createValueObserver(
        'process_active_requests_total_count',
        {
          description: "Total count of process's active requests"
        },
        (valueObserver) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          valueObserver.observe(process._getActiveRequests().length, labels);
        }
      );
    }

    if (process.platform === 'linux') {
      this.meter.createValueObserver(
        'process_open_file_descriptors_count',
        {
          description: "Count of process's open file descriptors"
        },
        (valueObserver) => {
          try {
            const fileDescriptors = fs.readdirSync('/proc/self/fd');
            valueObserver.observe(fileDescriptors.length - 1, labels);
          } catch {
            // NOOP
          }
        }
      );
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (typeof process._getActiveHandles === 'function' && Array.isArray(process._getActiveHandles())) {
      this.meter.createValueObserver(
        'process_active_handles_total_count',
        {
          description: "Total count of process's active handles"
        },
        (valueObserver) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          valueObserver.observe(process._getActiveHandles().length, labels);
        }
      );
    }

    let previousCpuUsage: CpuUsage;

    this.meter.createValueObserver(
      'process_cpu_usage_percentage',
      {
        description: 'CPU usage percentage of process'
      },
      (valueObserver) => {
        const cpuUsage = process.cpuUsage(previousCpuUsage);
        const totalCpuUsageInMillis = (cpuUsage.user + cpuUsage.system) / 1000;
        valueObserver.observe((totalCpuUsageInMillis / DEFAULT_METER_INTERVAL_IN_MILLIS) * 100, labels);
        previousCpuUsage = cpuUsage;
      }
    );

    if (process.platform === 'linux') {
      this.meter.createValueObserver(
        'container_memory_usage_megabytes',
        {
          description: 'Container memory usage in megabytes'
        },
        (valueObserver) => {
          try {
            const memoryUsageInBytesStr = fs.readFileSync('/sys/fs/cgroup/memory/memory.usage_in_bytes', {
              encoding: 'UTF-8'
            });
            // noinspection MagicNumberJS
            const memoryUsageInMegaBytes = parseInt(memoryUsageInBytesStr, 10) / (1024 * 1024);
            valueObserver.observe(memoryUsageInMegaBytes, labels);
          } catch {
            // NOOP
          }
        }
      );
    }

    if (process.platform === 'linux') {
      this.meter.createValueObserver(
        'container_memory_limit_megabytes',
        {
          description: 'Container memory limit in megabytes'
        },
        (valueObserver) => {
          try {
            const memoryLimitInBytesStr = fs.readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', {
              encoding: 'UTF-8'
            });
            // noinspection MagicNumberJS
            const memoryLimitInMegaBytes = parseInt(memoryLimitInBytesStr, 10) / (1024 * 1024);
            valueObserver.observe(memoryLimitInMegaBytes, labels);
          } catch {
            // NOOP
          }
        }
      );
    }

    const gcKindToTypeMap: { [key: string]: string } = {};
    gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR.toString()] = 'major';
    gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR.toString()] = 'minor';
    gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL.toString()] = 'incremental';
    gcKindToTypeMap[perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB.toString()] = 'weakcb';

    // noinspection MagicNumberJS
    const gcDurationInSecsBuckets = [0.001, 0.01, 0.1, 1, 2, 5, Number.POSITIVE_INFINITY];

    const garbageCollectionObserver = new perf_hooks.PerformanceObserver((list) => {
      const { kind, duration } = list.getEntries()[0];
      const durationInSecs = duration / 1000;
      const foundGcDurationBucket = gcDurationInSecsBuckets.find(
        (gcDurationBucket) => durationInSecs <= gcDurationBucket
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const gcType = gcKindToTypeMap[kind!.toString()];

      this.garbageCollectionDurationBucketCounter
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .bind({ ...labels, gcType, gcDurationBucket: foundGcDurationBucket!.toString() })
        .add(1);
    });

    garbageCollectionObserver.observe({ entryTypes: ['gc'], buffered: false });
  }
}

export default new DefaultSystemAndNodeJsMetrics(defaultPrometheusMeter);
