import { router } from './trpc';
import { affiliateRouter } from './affiliate';
import { productsRouter } from './products';
import { contentRouter } from './content';
import { cartRouter } from './cart';
import { ordersRouter } from './orders';
import { usersRouter } from './users';
import { authRouter } from './auth';
import { filesRouter } from './files';

export const appRouter = router({
	affiliate: affiliateRouter,
	products: productsRouter,
	content: contentRouter,
	cart: cartRouter,
	orders: ordersRouter,
	users: usersRouter,
	auth: authRouter,
	files: filesRouter
});

export type AppRouter = typeof appRouter;
