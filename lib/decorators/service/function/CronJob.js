"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJob = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
const defaultRetryIntervals_1 = __importDefault(require("../../../scheduling/defaultRetryIntervals"));
function getCronValuesStr(values) {
    if (values === undefined || values === 'any') {
        return '*';
    }
    if (typeof values === 'number') {
        return values.toString();
    }
    if (Array.isArray(values)) {
        return values.map((value) => value.toString()).join(',');
    }
    return values.start + '-' + values.end;
}
function getCronIntervalStr(interval) {
    if (interval === undefined) {
        return '';
    }
    return '/' + interval;
}
function CronJob(cronSchedule, retryIntervalsInSecs = defaultRetryIntervals_1.default) {
    const cronScheduleStr = Array(6)
        .fill('')
        .map((defaultCronParameter, index) => {
        if (index === 0) {
            return '0';
        }
        else if (index === 1) {
            return getCronValuesStr(cronSchedule.minutes) + getCronIntervalStr(cronSchedule.minuteInterval);
        }
        else if (index === 2) {
            if ((cronSchedule.hours !== undefined || cronSchedule.hourInterval !== undefined) &&
                cronSchedule.minutes === undefined) {
                throw new Error('You must specify minutes for schedule');
            }
            return getCronValuesStr(cronSchedule.hours) + getCronIntervalStr(cronSchedule.hourInterval);
        }
        else if (index === 3) {
            if ((cronSchedule.daysOfMonth !== undefined || cronSchedule.dayInterval !== undefined) &&
                (cronSchedule.minutes === undefined || cronSchedule.hours === undefined)) {
                throw new Error('You must specify minutes and hours for schedule');
            }
            return getCronValuesStr(cronSchedule.daysOfMonth) + getCronIntervalStr(cronSchedule.dayInterval);
        }
        else if (index === 4) {
            if ((cronSchedule.months !== undefined || cronSchedule.monthInterval !== undefined) &&
                (cronSchedule.minutes === undefined ||
                    cronSchedule.hours === undefined ||
                    cronSchedule.daysOfMonth === undefined)) {
                throw new Error('You must specify minutes, hours and daysOfMonth for schedule');
            }
            return getCronValuesStr(cronSchedule.months) + getCronIntervalStr(cronSchedule.monthInterval);
        }
        else if (index === 5) {
            if ((cronSchedule.daysOfWeek !== undefined || cronSchedule.weekDayInterval !== undefined) &&
                (cronSchedule.minutes === undefined || cronSchedule.hours === undefined)) {
                throw new Error('You must specify minutes and hours for schedule');
            }
            return getCronValuesStr(cronSchedule.daysOfWeek) + getCronIntervalStr(cronSchedule.weekDayInterval);
        }
        return defaultCronParameter;
    })
        .join(' ');
    return function (object, functionName) {
        const superClassPrototype = Object.getPrototypeOf(object);
        const cronSchedule = serviceFunctionAnnotationContainer_1.default.getServiceFunctionNameToCronScheduleMap()[`${superClassPrototype.constructor.name.charAt(0).toLowerCase() +
            superClassPrototype.constructor.name.slice(1)}.${functionName}`];
        if (cronSchedule) {
            throw new Error('Only one cron job allowed per service function');
        }
        serviceFunctionAnnotationContainer_1.default.addCronScheduleForServiceFunction(superClassPrototype.constructor, functionName, cronScheduleStr);
        serviceFunctionAnnotationContainer_1.default.addRetryIntervalsInSecsForServiceFunction(superClassPrototype.constructor, functionName, retryIntervalsInSecs);
        serviceFunctionAnnotationContainer_1.default.addServiceFunctionAllowedForClusterInternalUse(object.constructor, functionName);
    };
}
exports.CronJob = CronJob;
//# sourceMappingURL=CronJob.js.map