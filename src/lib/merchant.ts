import { prisma } from './prisma';
import { requireMerchant } from './auth';
import { HttpError } from './http';

/**
 * Resolves the signed-in merchant and THEIR shop. Every merchant route derives
 * the shop from the session — never from a client-supplied id — which is what
 * enforces tenant isolation. `requireActive` additionally blocks mutations on
 * suspended shops.
 */
export async function getMerchantContext(opts: { requireActive?: boolean } = {}) {
  const user = await requireMerchant();
  const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
  if (!shop) throw new HttpError(404, 'No shop is linked to this account');
  if (opts.requireActive && shop.status !== 'ACTIVE') {
    throw new HttpError(403, 'Your shop is currently suspended. Please contact mall support.');
  }
  return { user, shop };
}
