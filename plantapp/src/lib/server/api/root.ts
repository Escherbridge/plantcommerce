import { router } from './trpc';
import { affiliateRouter } from './affiliate';
import { productsRouter } from './products';
import { contentRouter } from './content';
import { cartRouter } from './cart';
import { ordersRouter } from './orders';
import { usersRouter } from './users';
import { authRouter } from './auth';
import { filesRouter } from './files';
import { adminRouter } from './admin';
import { lmsRouter } from './lms';
import { notificationRouter } from './notification';

export const appRouter = router({
	affiliate: affiliateRouter,
	products: productsRouter,
	content: contentRouter,
	cart: cartRouter,
	orders: ordersRouter,
	users: usersRouter,
	auth: authRouter,
	files: filesRouter,
	admin: adminRouter,
	lms: lmsRouter,
	notification: notificationRouter
});

export type AppRouter = typeof appRouter;
