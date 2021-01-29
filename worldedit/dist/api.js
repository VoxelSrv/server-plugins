"use strict";
exports.__esModule = true;
exports.API = void 0;
var API = /** @class */ (function () {
    function API(server) {
        this._server = server;
        this._registry = server.registry;
    }
    API.prototype.set = function (p1, p2, world, block) {
        var _this = this;
        var getBlock = function () {
            return _this._registry.blocks['air'];
        };
        if (Array.isArray(block)) {
            getBlock = function () {
                return block[(Math.random() * block.length) | 0];
            };
        }
        else
            getBlock = function () {
                return block;
            };
        var x1 = p1[0] >= p2[0] ? p2[0] : p1[0];
        var y1 = p1[1] >= p2[1] ? p2[1] : p1[1];
        var z1 = p1[2] >= p2[2] ? p2[2] : p1[2];
        var x2 = p1[0] >= p2[0] ? p1[0] : p2[0];
        var y2 = p1[1] >= p2[1] ? p1[1] : p2[1];
        var z2 = p1[2] >= p2[2] ? p1[2] : p2[2];
        for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
                for (var z = z1; z <= z2; z++) {
                    var b = getBlock();
                    world.setBlock([x, y, z], b.numId, true);
                    this._server.players.sendPacketAll('WorldBlockUpdate', { x: x, y: y, z: z, id: b.numId });
                }
            }
        }
    };
    API.prototype.replace = function (p1, p2, world, block, org) {
        var _this = this;
        var getBlock = function () {
            return _this._registry.blocks['air'];
        };
        if (Array.isArray(block)) {
            getBlock = function () {
                return block[(Math.random() * block.length) | 0];
            };
        }
        else
            getBlock = function () {
                return block;
            };
        var x1 = p1[0] >= p2[0] ? p2[0] : p1[0];
        var y1 = p1[1] >= p2[1] ? p2[1] : p1[1];
        var z1 = p1[2] >= p2[2] ? p2[2] : p1[2];
        var x2 = p1[0] >= p2[0] ? p1[0] : p2[0];
        var y2 = p1[1] >= p2[1] ? p1[1] : p2[1];
        var z2 = p1[2] >= p2[2] ? p1[2] : p2[2];
        if (Array.isArray(org)) {
            var oObj_1 = {};
            org.forEach(function (o) { return (oObj_1[o.numId] = true); });
            for (var x = x1; x <= x2; x++) {
                for (var y = y1; y <= y2; y++) {
                    for (var z = z1; z <= z2; z++) {
                        var xyz = [x, y, z];
                        if (!oObj_1[world.getBlockSync(xyz, false).numId])
                            continue;
                        var b = getBlock();
                        world.setBlock(xyz, b.numId, false);
                        this._server.players.sendPacketAll('WorldBlockUpdate', { x: x, y: y, z: z, id: b.numId });
                    }
                }
            }
        }
        else {
            var o = org.numId;
            for (var x = x1; x <= x2; x++) {
                for (var y = y1; y <= y2; y++) {
                    for (var z = z1; z <= z2; z++) {
                        var xyz = [x, y, z];
                        if (world.getBlockSync(xyz, false).numId != o)
                            continue;
                        var b = getBlock();
                        this._server.players.sendPacketAll('WorldBlockUpdate', { x: x, y: y, z: z, id: b.numId });
                        world.setBlock(xyz, b.numId, false);
                    }
                }
            }
        }
    };
    return API;
}());
exports.API = API;
//# sourceMappingURL=api.js.map