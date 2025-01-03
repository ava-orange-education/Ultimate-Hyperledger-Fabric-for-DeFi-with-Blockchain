"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = exports.EstateRegistrarContract = exports.EstateUserContract = void 0;
const EstateUserContract_1 = require("./EstateUserContract");
Object.defineProperty(exports, "EstateUserContract", { enumerable: true, get: function () { return EstateUserContract_1.EstateUserContract; } });
const EstateRegistrarContract_1 = require("./EstateRegistrarContract");
Object.defineProperty(exports, "EstateRegistrarContract", { enumerable: true, get: function () { return EstateRegistrarContract_1.EstateRegistrarContract; } });
exports.contracts = [EstateUserContract_1.EstateUserContract, EstateRegistrarContract_1.EstateRegistrarContract];
