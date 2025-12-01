import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from './order';
import { db } from '$lib/server/db';
import { CartService } from './cart';
import AffiliateService from './affiliate';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn()
            })
        }),
        delete: vi.fn()
    }
}));

vi.mock('./cart', () => ({
    CartService: {
        getCart: vi.fn(),
        clearCart: vi.fn()
    }
}));

vi.mock('./affiliate', () => ({
    productId: 1,
    quantity: 2,
    unitPrice: '10.00',
    product: {
        name: 'Test Product',
        sku: 'TEST-001',
        trackInventory: true,
        stockQuantity: 10
    }
}],
    totalAmount: 20.00,
    affiliateLinkId: 1
            });

// Mock order number generation (check for existing)
const limitMock = vi.fn().mockResolvedValue([]);
const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
const fromMock = vi.fn().mockReturnValue({ where: whereMock });
(db.select as any).mockReturnValue({ from: fromMock });

// Mock order insert
const returningMock = vi.fn().mockResolvedValue([{ id: 1 }]);
const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
(db.insert as any).mockReturnValue({ values: valuesMock });

// Mock getOrderById (for return value)
// We need to mock the select call inside getOrderById
const orderLimitMock = vi.fn().mockResolvedValue([{
    id: 1,
    orderNumber: 'ORD-123',
    status: 'pending',
    totalAmount: '26.60', // 20 + 1.6 (tax) + 5 (shipping)
    shippingAddress: '{}',
    billingAddress: '{}',
    createdAt: new Date(),
    updatedAt: new Date()
}]);
const orderWhereMock = vi.fn().mockReturnValue({ limit: orderLimitMock });
const orderFromMock = vi.fn().mockReturnValue({ where: orderWhereMock });

const itemsWhereMock = vi.fn().mockResolvedValue([]);
const itemsFromMock = vi.fn().mockReturnValue({ where: itemsWhereMock });

(db.select as any)
    .mockReturnValueOnce({ from: fromMock }) // Order number check
    .mockReturnValueOnce({ from: orderFromMock }) // getOrderById: order
    .mockReturnValueOnce({ from: itemsFromMock }); // getOrderById: items

const order = await OrderService.createOrder({
    userId: 'user123',
    customerEmail: 'test@example.com',
    shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        address1: '123 Main St',
        city: 'City',
        state: 'State',
        postalCode: '12345',
        country: 'Country'
    }
});

expect(order.id).toBe(1);
expect(CartService.getCart).toHaveBeenCalled();
expect(db.insert).toHaveBeenCalledTimes(2); // Order and OrderItems
expect(CartService.clearCart).toHaveBeenCalled();
        });

it('should throw error if cart is empty', async () => {
    (CartService.getCart as any).mockResolvedValue(null);

    await expect(OrderService.createOrder({
        customerEmail: 'test@example.com',
        shippingAddress: {} as any
    })).rejects.toThrow('Cart is empty');
});
    });

describe('getOrderById', () => {
    it('should return order details', async () => {
        const limitMock = vi.fn().mockResolvedValue([{
            id: 1,
            orderNumber: 'ORD-123',
            status: 'pending',
            shippingAddress: '{}',
            billingAddress: '{}'
        }]);
        const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
        const fromMock = vi.fn().mockReturnValue({ where: whereMock });

        const itemsWhereMock = vi.fn().mockResolvedValue([{
            id: 1,
            productId: 1,
            productName: 'Test Product',
            quantity: 1,
            unitPrice: '10.00',
            totalPrice: '10.00'
        }]);
        const itemsFromMock = vi.fn().mockReturnValue({ where: itemsWhereMock });

        (db.select as any)
            .mockReturnValueOnce({ from: fromMock })
            .mockReturnValueOnce({ from: itemsFromMock });

        const order = await OrderService.getOrderById(1);

        expect(order.id).toBe(1);
        expect(order.items).toHaveLength(1);
    });
});
});
