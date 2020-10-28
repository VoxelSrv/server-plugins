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
                    world.setBlock([x, y, z], b.rawid, true);
                    this._server.players.sendPacketAll('WorldBlockUpdate', { x: x, y: y, z: z, id: b.rawid });
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
            org.forEach(function (o) { return (oObj_1[o.rawid] = true); });
            for (var x = x1; x <= x2; x++) {
                for (var y = y1; y <= y2; y++) {
                    for (var z = z1; z <= z2; z++) {
                        var xyz = [x, y, z];
                        if (!oObj_1[world.getBlock(xyz, false).rawid])
                            continue;
                        var b = getBlock();
                        world.setBlock(xyz, b.rawid, false);
                        this._server.players.sendPacketAll('WorldBlockUpdate', { x: x, y: y, z: z, id: b.rawid });
                    }
                }
            }
        }
        else {
            var o = org.rawid;
            for (var x = x1; x <= x2; x++) {
                for (var y = y1; y <= y2; y++) {
                    for (var z = z1; z <= z2; z++) {
                        var xyz = [x, y, z];
                        if (world.getBlock(xyz, false).rawid != o)
                            continue;
                        var b = getBlock();
                        this._server.players.sendPacketAll('WorldBlockUpdate', { x: x, y: y, z: z, id: b.rawid });
                        world.setBlock(xyz, b.rawid, false);
                    }
                }
            }
        }
    };
    return API;
}());
exports.API = API;
//# sourceMappingURL=api.js.map