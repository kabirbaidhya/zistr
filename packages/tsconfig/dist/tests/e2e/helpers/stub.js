"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = exports.UpdateOrderDto = exports.CreateOrderDto = void 0;
const index_1 = require("../../../index");
class CreateOrderDto extends index_1.BaseDto {
    validate() {
        if (typeof this.item !== 'string' || this.item.trim() === '') {
            throw new Error('Item must be a non-empty string');
        }
        if (typeof this.quantity !== 'number' || !Number.isInteger(this.quantity) || this.quantity <= 0) {
            throw new Error('Quantity must be a positive integer');
        }
    }
}
exports.CreateOrderDto = CreateOrderDto;
class UpdateOrderDto extends index_1.BaseDto {
}
exports.UpdateOrderDto = UpdateOrderDto;
let OrdersController = class OrdersController extends index_1.BaseController {
    listOrders(query) {
        return { query };
    }
    createOrder(dto) {
        return { created: true, data: dto };
    }
    getOrder(params) {
        return { id: params.id };
    }
    updateOrder(params, dto) {
        return { id: params.id, updated: dto.quantity };
    }
    deleteOrder(params) {
        return { id: params.id, deleted: true };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, index_1.Get)(),
    __param(0, (0, index_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "listOrders", null);
__decorate([
    (0, index_1.Post)('/'),
    __param(0, (0, index_1.ReqBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, index_1.Get)('/:id'),
    __param(0, (0, index_1.Params)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrder", null);
__decorate([
    (0, index_1.Put)('/:id'),
    __param(0, (0, index_1.Params)()),
    __param(1, (0, index_1.ReqBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateOrder", null);
__decorate([
    (0, index_1.Delete)('/:id'),
    __param(0, (0, index_1.Params)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "deleteOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, index_1.Controller)('/orders')
], OrdersController);
