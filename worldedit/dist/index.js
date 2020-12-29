"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Plugin = void 0;
var chat_1 = require("voxelsrv-server/dist/lib/chat");
var registry_1 = require("voxelsrv-server/dist/lib/registry");
var api_1 = require("./api");
var Plugin = /** @class */ (function () {
    function Plugin(server) {
        var _this = this;
        this.name = 'WorldEdit';
        this.version = '0.0.4';
        this.supportedGameAPI = '>=0.2.0-beta.17';
        this.game = 'voxelsrv';
        this.supportedAPI = '0.1.6';
        var storage = {};
        this.api = new api_1.API(server);
        server.on('registry-define', function () {
            var wand = new registry_1.ItemTool('we:wand', 'WorldEdit Tool', 'item/totem_of_undying', 'worldedit', Infinity, -1, -1);
            // @ts-ignore
            server.registry.addItem(wand);
        });
        server.on('player-join', function (player) {
            storage[player.id] = { p1: [0, 0, 0], p2: [0, 0, 0] };
        });
        server.on('player-remove', function (player) {
            delete storage[player.id];
        });
        server.on('player-blockbreak-1', function (player, data) {
            var sel = player.inventory.selected;
            // @ts-ignore
            if (player.inventory.items[sel].id == 'we:wand') {
                data.cancel = true;
            }
        });
        server.on('player-click-4', function (player, data) {
            if (!data.onBlock)
                return;
            // @ts-ignore
            if (player.inventory.items[player.inventory.selected].id == 'we:wand') {
                if (data.type == 'left') {
                    storage[player.id].p1 = [data.x, data.y, data.z];
                    player.send([new chat_1.ChatComponent("Pos1 is now set to ", '#00c400'), new chat_1.ChatComponent(data.x + ", " + data.y + ", " + data.z, '#59ff59')]);
                }
                else if (data.type == 'right') {
                    storage[player.id].p2 = [data.x, data.y, data.z];
                    player.send([new chat_1.ChatComponent("Pos2 is now set to ", '#00c400'), new chat_1.ChatComponent(data.x + ", " + data.y + ", " + data.z, '#59ff59')]);
                }
            }
        });
        var setCommand = function (executor, args) { return __awaiter(_this, void 0, void 0, function () {
            var id, block_1;
            return __generator(this, function (_a) {
                if (executor.id == '#console')
                    return [2 /*return*/];
                id = executor.id;
                if (executor.permissions.check('worldedit.set')) {
                    if (args[0].includes(',')) {
                        block_1 = [];
                        args[0].split(',').forEach(function (e) { return block_1.push(server.registry.blocks[e]); });
                    }
                    else
                        block_1 = server.registry.blocks[args[0]];
                    if (block_1 == undefined) {
                        executor.send([new chat_1.ChatComponent("Invalid block! " + args[0] + " doesn't exist!", 'red')]);
                        return [2 /*return*/];
                    }
                    this.api.set(storage[id].p1, storage[id].p2, executor.world, block_1);
                    executor.send([new chat_1.ChatComponent("Done!", '#00c40')]);
                    return [2 /*return*/];
                }
                executor.send([new chat_1.ChatComponent("You can't use this command!", 'red')]);
                return [2 /*return*/];
            });
        }); };
        server.registry.addCommand(new registry_1.Command('/set', setCommand, 'Sets selected region to block.'));
        var repCommand = function (executor, args) { return __awaiter(_this, void 0, void 0, function () {
            var id, original_1, block_2;
            return __generator(this, function (_a) {
                if (executor.id == '#console')
                    return [2 /*return*/];
                id = executor.id;
                if (executor.permissions.check('worldedit.replace')) {
                    if (args[0].includes(',')) {
                        original_1 = [];
                        args[0].split(',').forEach(function (e) { return original_1.push(server.registry.blocks[e]); });
                    }
                    else
                        original_1 = server.registry.blocks[args[0]];
                    if (original_1 == undefined) {
                        executor.send([new chat_1.ChatComponent("Invalid block! " + args[0] + " doesn't exist!", 'red')]);
                        return [2 /*return*/];
                    }
                    if (args[1].includes(',')) {
                        block_2 = [];
                        args[1].split(',').forEach(function (e) { return block_2.push(server.registry.blocks[e]); });
                    }
                    else
                        block_2 = server.registry.blocks[args[1]];
                    if (block_2 == undefined) {
                        executor.send([new chat_1.ChatComponent("Invalid block! " + args[0] + " doesn't exist!", 'red')]);
                        return [2 /*return*/];
                    }
                    this.api.replace(storage[id].p1, storage[id].p2, executor.world, block_2, original_1);
                    executor.send([new chat_1.ChatComponent("Done!", '#00c40')]);
                    return [2 /*return*/];
                }
                executor.send([new chat_1.ChatComponent("You can't use this command!", 'red')]);
                return [2 /*return*/];
            });
        }); };
        server.registry.addCommand(new registry_1.Command('/replace', repCommand, 'Replaces blocks within region.'));
        server.registry.addCommand(new registry_1.Command('/rep', repCommand, 'See /replace'));
        var upCommand = function (executor, args) { return __awaiter(_this, void 0, void 0, function () {
            var id, pos, block;
            return __generator(this, function (_a) {
                if (executor.id == '#console')
                    return [2 /*return*/];
                id = executor.id;
                if (executor.permissions.check('worldedit.up')) {
                    pos = executor.entity.data.position;
                    block = 1;
                    if (!!server.registry.blocks['glass'])
                        block = server.registry.blocks['glass'].rawid;
                    if (!!server.registry.blocks[args[1]])
                        block = server.registry.blocks[args[1]].rawid;
                    executor.world.setBlock([Math.floor(pos[0]), Math.floor(pos[1]) + parseInt(args[0]), Math.floor(pos[2])], block, false);
                    server.players.sendPacketAll('WorldBlockUpdate', {
                        x: Math.floor(pos[0]),
                        y: Math.floor(pos[1]) + parseInt(args[0]),
                        z: Math.floor(pos[2]),
                        id: block
                    });
                    executor.teleport([pos[0], Math.floor(pos[1]) + parseInt(args[0]) + 1, pos[2]], executor.world);
                    executor.send([new chat_1.ChatComponent("Done!", '#00c40')]);
                    return [2 /*return*/];
                }
                executor.send([new chat_1.ChatComponent("You can't use this command!", 'red')]);
                return [2 /*return*/];
            });
        }); };
        server.registry.addCommand(new registry_1.Command('/up', upCommand, 'Creates block above and teleports player to it.'));
    }
    Plugin.prototype.getAPI = function () {
        return this.api;
    };
    return Plugin;
}());
exports.Plugin = Plugin;
//# sourceMappingURL=index.js.map