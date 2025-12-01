import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartService } from './cart';
import { db } from '$lib/server/db';

// Mock the database module
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

describe('CartService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getOrCreateCart', () => {
        it('should return existing cart id if found', async () => {
            // Mock chain: db.select().from().where().limit() -> [{ id: 1 }]
            const limitMock = vi.fn().mockResolvedValue([{ id: 1 }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            const cartId = await CartService.getOrCreateCart('user123');

            expect(cartId).toBe(1);
            expect(db.select).toHaveBeenCalled();
        });

        it('should create new cart if not found', async () => {
            // Mock select to return empty
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock insert
            const returningMock = vi.fn().mockResolvedValue([{ id: 2 }]);
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
            (db.insert as any).mockReturnValue({ values: valuesMock });

            const cartId = await CartService.getOrCreateCart('user123');

            expect(cartId).toBe(2);
            expect(db.insert).toHaveBeenCalled();
        });

        it('should throw error if no user or session provided', async () => {
            await expect(CartService.getOrCreateCart()).rejects.toThrow('Either userId or sessionId is required');
        });
    });

    describe('addItem', () => {
        it('should add new item to cart', async () => {
            // Mock product check
            const productLimitMock = vi.fn().mockResolvedValue([{
                id: 101,
                price: '10.00',
                trackInventory: true,
                stockQuantity: 100,
                isActive: true
            }]);
            const productWhereMock = vi.fn().mockReturnValue({ limit: productLimitMock });
            const productFromMock = vi.fn().mockReturnValue({ where: productWhereMock });

            // Mock getOrCreateCart (internal call)
            const cartLimitMock = vi.fn().mockResolvedValue([{ id: 1 }]); // Cart exists
            const cartWhereMock = vi.fn().mockReturnValue({ limit: cartLimitMock });
            const cartFromMock = vi.fn().mockReturnValue({ where: cartWhereMock });

            // Mock check for existing item
            const itemLimitMock = vi.fn().mockResolvedValue([]); // Item not in cart
            const itemWhereMock = vi.fn().mockReturnValue({ limit: itemLimitMock });
            const itemFromMock = vi.fn().mockReturnValue({ where: itemWhereMock });

            (db.select as any)
                .mockReturnValueOnce({ from: productFromMock }) // Product check
                .mockReturnValueOnce({ from: cartFromMock }) // getOrCreateCart
                .mockReturnValueOnce({ from: itemFromMock }); // check item

            // Mock insert item
            (db.insert as any).mockReturnValue({ values: vi.fn() });
            // Mock update cart timestamp
            const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
            (db.update as any).mockReturnValue({ set: setMock });

            await CartService.addItem(101, 2, 'user123');

            expect(db.insert).toHaveBeenCalled();
        });

        it('should update quantity if item exists', async () => {
            // Mock product check
            const productLimitMock = vi.fn().mockResolvedValue([{
                id: 101,
                price: '10.00',
                trackInventory: true,
                stockQuantity: 100,
                isActive: true
            }]);
            const productWhereMock = vi.fn().mockReturnValue({ limit: productLimitMock });
            const productFromMock = vi.fn().mockReturnValue({ where: productWhereMock });

            // Mock cart exists
            const cartLimitMock = vi.fn().mockResolvedValue([{ id: 1 }]);
            const cartWhereMock = vi.fn().mockReturnValue({ limit: cartLimitMock });
            const cartFromMock = vi.fn().mockReturnValue({ where: cartWhereMock });

            // Mock item exists
            const itemLimitMock = vi.fn().mockResolvedValue([{ id: 5, quantity: 1 }]);
            const itemWhereMock = vi.fn().mockReturnValue({ limit: itemLimitMock });
            const itemFromMock = vi.fn().mockReturnValue({ where: itemWhereMock });

            (db.select as any)
                .mockReturnValueOnce({ from: productFromMock }) // Product check
                .mockReturnValueOnce({ from: cartFromMock }) // getOrCreateCart
                .mockReturnValueOnce({ from: itemFromMock }); // check item

            // Mock update
            const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
            (db.update as any).mockReturnValue({ set: setMock });

            await CartService.addItem(101, 2, 'user123');

            expect(db.update).toHaveBeenCalled();
        });
    });

    describe('removeItem', () => {
        it('should remove item from cart', async () => {
            // Mock updateItemQuantity internal call which does a complex join
            const limitMock = vi.fn().mockResolvedValue([{
                cartItem: { id: 1, cartId: 1, productId: 101 },
                cart: { id: 1, userId: 'user123' },
                product: { id: 101, trackInventory: false }
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const join2Mock = vi.fn().mockReturnValue({ where: whereMock });
            const join1Mock = vi.fn().mockReturnValue({ innerJoin: join2Mock });
            const fromMock = vi.fn().mockReturnValue({ innerJoin: join1Mock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock delete
            const deleteWhereMock = vi.fn();
            (db.delete as any).mockReturnValue({ where: deleteWhereMock });

            // Mock update cart timestamp
            const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
            (db.update as any).mockReturnValue({ set: setMock });

            await CartService.removeItem(1, 'user123');

            expect(db.delete).toHaveBeenCalled();
        });
    });

    describe('clearCart', () => {
        it('should clear all items from cart', async () => {
            // Mock cart exists
            const limitMock = vi.fn().mockResolvedValue([{ id: 1 }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock delete
            const deleteWhereMock = vi.fn();
            (db.delete as any).mockReturnValue({ where: deleteWhereMock });

            // Mock update cart timestamp
            const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
            (db.update as any).mockReturnValue({ set: setMock });

            await CartService.clearCart('user123');

            expect(db.delete).toHaveBeenCalled();
        });
    });
});
