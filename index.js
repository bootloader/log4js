require('dotenv').config();
const config = require('@bootloader/config');
const {context} = require('@bootloader/utils');
const log4js = require("log4js");
const { isMainThread, threadId } = require("worker_threads");


let defaultLevel = config.getIfPresent('logging.level') || "info";
// Get the value of debug level (default is 10000)
const debugLevel = log4js.levels.getLevel("debug");
const infoLevel = log4js.levels.getLevel("info");


// log4js.levels.addLevels({
//   log: { value: debugLevel.value, colour: debugLevel.colour } // Higher value means higher priority
// });

log4js.configure({
    appenders: {
      console: { 
        type: "console",
        layout: {
          type: "pattern",
          pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} %5.5p %x{pid} --- [%x{thread} : %x{tnt}-%x{traceId}] %10.10c : %m",
          tokens : {
            pid(logEvent){
              return process.pid;
            },
            tnt(){
              return (context.getTenant() || "n/a").substring(0,3)
            },
            traceId(){
              return context.getTraceId()
            },
            thread(){
              return (isMainThread ? "main" : `t-${threadId}`) +'-' + (context?.getId ? context.getId() : "x");
            }
          }
        }
       },
      app: { type: "file", filename: "application.log" },
    },
    categories: {
      default: { appenders: ["console"], level: defaultLevel }
    }
  });

module.exports = {
    mapped : {},
    getLogger(category){
        let logger = log4js.getLogger(category)
        if(category && !this.mapped[category]){
            let level = config.getIfPresent(category ? (`logging.${category}.level`) : "logging.level") || defaultLevel;
            this.mapped[category] = true;
            logger.level = level;
        }
        return log4js.getLogger(category)
    }
}