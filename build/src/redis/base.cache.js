"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCache = void 0;
const redis_1 = require("redis");
const config_1 = require("../configs/config");
class BaseCache {
    constructor(cacheName) {
        this.client = (0, redis_1.createClient)({ url: config_1.config.REDIS_HOST });
        this.log = config_1.config.createLogger(cacheName);
        this.cacheError();
    }
    cacheError() {
        this.client.on('error', (error) => {
            this.log.error(error);
        });
    }
}
exports.BaseCache = BaseCache;
//# sourceMappingURL=base.cache.js.map