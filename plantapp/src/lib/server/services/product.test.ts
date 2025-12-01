import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from './product';
import { db } from '$lib/server/db';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

vi.mock('./file', () => ({
    FileService: {
        generatePublicUrl: vi.fn().mockReturnValue('http://example.com/image.jpg')
    }
}));

describe('ProductService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createProduct', () => {
        it('should create a new product if slug and sku are unique', async () => {
            // Mock checks for existing product
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock category check
            const categoryLimitMock = vi.fn().mockResolvedValue([{ id: 1 }]);
            const categoryWhereMock = vi.fn().mockReturnValue({ limit: categoryLimitMock });
            const categoryFromMock = vi.fn().mockReturnValue({ where: categoryWhereMock });
            // We need to handle multiple select calls. 
            // First call is for product check, second for category check.
            (db.select as any)
                .mockReturnValueOnce({ from: fromMock }) // Product check
                .mockReturnValueOnce({ from: categoryFromMock }); // Category check

            // Mock insert
            const returningMock = vi.fn().mockResolvedValue([{
                id: 1,
                name: 'Test Product',
                slug: 'test-product',
                sku: 'TEST-001',
                price: '10.00',
                categoryId: 1,
                isActive: true
            }]);
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
            (db.insert as any).mockReturnValue({ values: valuesMock });

            const product = await ProductService.createProduct({
                name: 'Test Product',
                slug: 'test-product',
                sku: 'TEST-001',
                price: '10.00',
                categoryId: 1
            });

            expect(product.id).toBe(1);
            expect(db.insert).toHaveBeenCalled();
        });

        it('should throw error if slug exists', async () => {
            // Mock existing product
            const limitMock = vi.fn().mockResolvedValue([{ slug: 'test-product' }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            await expect(ProductService.createProduct({
                name: 'Test Product',
                slug: 'test-product',
                sku: 'TEST-001',
                price: '10.00',
                categoryId: 1
            })).rejects.toThrow('Slug already exists');
        });
    });

    describe('getProductById', () => {
        it('should return product with images', async () => {
            // Mock product fetch
            const limitMock = vi.fn().mockResolvedValue([{
                product: {
                    id: 1,
                    name: 'Test Product',
                    categoryId: 1
                },
                category: {
                    id: 1,
                    name: 'Test Category'
                }
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const joinMock = vi.fn().mockReturnValue({ where: whereMock });
            const fromMock = vi.fn().mockReturnValue({ innerJoin: joinMock });

            // Mock images fetch
            const imagesOrderByMock = vi.fn().mockResolvedValue([{
                image: { id: 1, fileId: 'file1' },
                file: { bucketPath: 'path/to/file', isPublic: true }
            }]);
            const imagesWhereMock = vi.fn().mockReturnValue({ orderBy: imagesOrderByMock });
            const imagesJoinMock = vi.fn().mockReturnValue({ where: imagesWhereMock });
            const imagesFromMock = vi.fn().mockReturnValue({ leftJoin: imagesJoinMock });

            (db.select as any)
                .mockReturnValueOnce({ from: fromMock }) // Product
                .mockReturnValueOnce({ from: imagesFromMock }); // Images

            const product = await ProductService.getProductById(1);

            expect(product).toBeDefined();
            expect(product?.id).toBe(1);
            expect(product?.images).toHaveLength(1);
        });

        it('should return null if product not found', async () => {
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const joinMock = vi.fn().mockReturnValue({ where: whereMock });
            const fromMock = vi.fn().mockReturnValue({ innerJoin: joinMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            const product = await ProductService.getProductById(999);

            expect(product).toBeNull();
        });
    });
});
