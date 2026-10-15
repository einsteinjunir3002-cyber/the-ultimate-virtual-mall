/**
 * WhatsApp Helper for Ghanaian Merchants
 * Converts phone numbers to clean international format and builds prefilled message links.
 */

export function sanitizeGhanaPhone(phone: string): string {
  // Remove non-numeric characters except +
  let cleaned = phone.replace(/[^0-9]/g, '');

  // If starts with 0 (e.g. 0244123456), convert to 233244123456
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '233' + cleaned.substring(1);
  }

  // If starts with +233
  if (cleaned.startsWith('233')) {
    return cleaned;
  }

  return cleaned;
}

export function buildProductWhatsAppLink(params: {
  whatsappNumber: string;
  shopName: string;
  productName: string;
  priceFormatted: string;
  productUrl: string;
}): string {
  const phone = sanitizeGhanaPhone(params.whatsappNumber);
  const text = encodeURIComponent(
    `Hello ${params.shopName}! I saw "${params.productName}" priced at ${params.priceFormatted} on The Ultimate Virtual Mall and would like to make an inquiry.\n\nProduct Link: ${params.productUrl}`
  );

  return `https://wa.me/${phone}?text=${text}`;
}

export function buildShopWhatsAppLink(params: {
  whatsappNumber: string;
  shopName: string;
  shopUrl: string;
}): string {
  const phone = sanitizeGhanaPhone(params.whatsappNumber);
  const text = encodeURIComponent(
    `Hello ${params.shopName}! I found your store on The Ultimate Virtual Mall (${params.shopUrl}) and would like to ask a question.`
  );

  return `https://wa.me/${phone}?text=${text}`;
}
