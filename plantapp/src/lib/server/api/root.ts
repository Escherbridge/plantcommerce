import { router } from './trpc';
import { affiliateRouter } from './affiliate';
import { productsRouter } from './products';
import { contentRouter } from './content';

export const appRouter = router({
	affiliate: affiliateRouter,
	products: productsRouter,
	content: contentRouter
});

export type AppRouter = typeof appRouter;
