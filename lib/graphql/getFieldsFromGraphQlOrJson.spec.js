"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getFieldsFromGraphQlOrJson_1 = __importDefault(require("./getFieldsFromGraphQlOrJson"));
describe('getFieldsFromGraphQl', () => {
    it('should return fields array from Graph QL query string', () => {
        const fields = getFieldsFromGraphQlOrJson_1.default(`
    {
      _id
      userName
      orderItems {
        salesItemId
        quantity
        delivery {
          status
          trackingUrl
        }
      }
    }
    `);
        expect(fields.length).toBe(6);
        expect(fields[0]).toEqual('_id');
        expect(fields[1]).toEqual('userName');
        expect(fields[2]).toEqual('orderItems.salesItemId');
        expect(fields[3]).toEqual('orderItems.quantity');
        expect(fields[4]).toEqual('orderItems.delivery.status');
        expect(fields[5]).toEqual('orderItems.delivery.trackingUrl');
    });
    it('should return fields array from JSON string', () => {
        const fields = getFieldsFromGraphQlOrJson_1.default(JSON.stringify({
            _id: true,
            userName: true,
            orderItems: {
                salesItemId: true,
                quantity: true,
                delivery: {
                    status: true,
                    trackingUrl: true
                }
            }
        }));
        expect(fields.length).toBe(6);
        expect(fields[0]).toEqual('_id');
        expect(fields[1]).toEqual('userName');
        expect(fields[2]).toEqual('orderItems.salesItemId');
        expect(fields[3]).toEqual('orderItems.quantity');
        expect(fields[4]).toEqual('orderItems.delivery.status');
        expect(fields[5]).toEqual('orderItems.delivery.trackingUrl');
    });
});
//# sourceMappingURL=getFieldsFromGraphQlOrJson.spec.js.map