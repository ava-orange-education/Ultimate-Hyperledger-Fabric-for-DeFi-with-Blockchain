"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assetContract_1 = require("./assetContract");
const fabric_shim_1 = require("fabric-shim");
fabric_shim_1.Shim.start(new assetContract_1.assetContract());
