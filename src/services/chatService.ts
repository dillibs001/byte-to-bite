import { Session } from '../models/session';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { initializePaystackPayment } from './paystackService';

const MAIN_MENU = 
  `Welcome to Byte-to-Bite! 🍔\n\n` +
  `Reply with a number option to proceed:\n` +
  `Select 1️⃣ to Place an order\n` +
  `Select 9️⃣9️⃣ to checkout order\n` +
  `Select 9️⃣8️⃣ to see order history\n` +
  `Select 9️⃣7️⃣ to see current order\n` +
  `Select 0️⃣ to cancel order`;

export const processUserMessage = async (deviceId: string, input: string): Promise<string> => {
  let session = await Session.findOne({ deviceId });
  
  if (!session) {
    await Session.create({ deviceId, currentState: 'IDLE' });
    return MAIN_MENU;
  }

  switch (session.currentState) {
    case 'IDLE':
      return await handleIdleState(input, deviceId, session);
    case 'CHOOSING_MENU':
      return await handleChoosingMenuState(input, deviceId, session);
    case 'AWAITING_PAYMENT':
      return await handleAwaitingPaymentState(input, deviceId, session);
    default:
      return MAIN_MENU;
  }
};

async function handleIdleState(input: string, deviceId: string, session: any): Promise<string> {
  switch (input) {
    case '1': 
      const products = await Product.find().sort({ numberId: 1 });
      let menuReply = `📋 **TODAY'S RESTAURANT MENU** 📋\n\n`;
      products.forEach(p => {
        menuReply += `Press **${p.numberId}** for ${p.name} — ₦${p.price.toLocaleString()}\n`;
      });
      menuReply += `\nType **00** at any time to return to the Main Menu.`;
      
      session.currentState = 'CHOOSING_MENU';
      await session.save();
      return menuReply;

    case '97': 
      const currentOrder = await Order.findOne({ deviceId, status: 'PENDING' });
      if (!currentOrder || currentOrder.items.length === 0) {
        return `Your current cart is empty. Press 1 to browse the menu!\n\n${MAIN_MENU}`;
      }
      let cartText = `🛒 **YOUR CURRENT ORDER** 🛒\n\n`;
      currentOrder.items.forEach(item => {
        cartText += `• ${item.name} (x${item.quantity}) — ₦${(item.price * item.quantity).toLocaleString()}\n`;
      });
      cartText += `\n💰 **Total Amount:** ₦${currentOrder.totalAmount.toLocaleString()}\n\nReply 99 to checkout or 0 to clear.`;
      return cartText;

    case '98': 
      const pastOrders = await Order.find({ deviceId, status: { $ne: 'PENDING' } }).sort({ createdAt: -1 });
      if (pastOrders.length === 0) {
        return `You have no past order records.\n\n${MAIN_MENU}`;
      }
      let historyText = `📜 **YOUR ORDER HISTORY** 📜\n\n`;
      pastOrders.forEach((order, index) => {
        historyText += `${index + 1}. Order Code: ...${order._id.toString().slice(-6)} | Status: [${order.status}] | Total: ₦${order.totalAmount.toLocaleString()}\n`;
      });
      return historyText;

    case '99': 
      const checkoutCart = await Order.findOne({ deviceId, status: 'PENDING' });
      if (!checkoutCart || checkoutCart.items.length === 0) {
        return `❌ No order to place. Please add items to your cart first.\n\n${MAIN_MENU}`;
      }
      session.currentState = 'AWAITING_PAYMENT';
      await session.save();
      return `💳 Ready to check out. Total is ₦${checkoutCart.totalAmount.toLocaleString()}.\n\nReply with **PAY** to generate your secure link.`;

    case '0': 
      const activeCart = await Order.findOne({ deviceId, status: 'PENDING' });
      if (!activeCart) {
        return `You don't have an active pending order to cancel.\n\n${MAIN_MENU}`;
      }
      await Order.deleteOne({ _id: activeCart._id });
      return `💥 Your active order has been cancelled and cleared.\n\n${MAIN_MENU}`;

    default:
      return `⚠️ Invalid selection. Please follow the instructions:\n\n${MAIN_MENU}`;
  }
}

async function handleChoosingMenuState(input: string, deviceId: string, session: any): Promise<string> {
  if (input === '00') {
    session.currentState = 'IDLE';
    await session.save();
    return MAIN_MENU;
  }

  if (input === '99') {
    session.currentState = 'AWAITING_PAYMENT';
    await session.save();
    const checkoutCart = await Order.findOne({ deviceId, status: 'PENDING' });
    return `💳 Ready to check out. Total is ₦${checkoutCart?.totalAmount.toLocaleString()}.\n\nReply with **PAY** to generate your secure link.`;
  }

  const matchedProduct = await Product.findOne({ numberId: parseInt(input) });
  if (!matchedProduct) {
    return `⚠️ Invalid meal option. Reply with an active menu item number, or **00** to return to the main menu.`;
  }

  let order = await Order.findOne({ deviceId, status: 'PENDING' });
  if (!order) {
    order = new Order({ deviceId, items: [], totalAmount: 0, status: 'PENDING' });
  }

  const itemIndex = order.items.findIndex(item => item.product.toString() === matchedProduct._id.toString());
  if (itemIndex > -1) {
    order.items[itemIndex].quantity += 1;
  } else {
    order.items.push({
      product: matchedProduct._id as any,
      name: matchedProduct.name,
      price: matchedProduct.price,
      quantity: 1
    });
  }

  order.totalAmount = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  await order.save();

  session.currentOrderId = order._id as any;
  await session.save();

  return `✅ Added **${matchedProduct.name}** to your cart!\n\n` +
         `Current Total: ₦${order.totalAmount.toLocaleString()}\n\n` +
         `👉 Reply with another food number to add more items.\n` +
         `👉 Reply **00** to return to the main menu.\n` +
         `👉 Reply **99** to immediately jump to payment checkout.`;
}

async function handleAwaitingPaymentState(input: string, deviceId: string, session: any): Promise<string> {
  if (input === '0' || input === '00') {
    await Order.findOneAndUpdate({ deviceId, status: 'PENDING' }, { status: 'CANCELLED' });
    session.currentState = 'IDLE';
    session.currentOrderId = null;
    await session.save();
    return `❌ Pending order successfully cancelled. Returning to Main Menu!\n\n${MAIN_MENU}`;
  }

  if (input.toUpperCase() === 'PAY') {
    const activeOrder = await Order.findOne({ deviceId, status: 'PENDING' });
    if (!activeOrder) {
      session.currentState = 'IDLE';
      await session.save();
      return `❌ Your cart expired or was cleared. Returning to main menu.\n\n${MAIN_MENU}`;
    }

    const testEmail = `customer_${deviceId.slice(-6)}@statebite.com`;
    
    try {
      const paymentData = await initializePaystackPayment(testEmail, activeOrder.totalAmount);
      return `💳 **SECURE PAYMENT GENERATED** 💳\n\n` +
             `Your total bill is ₦${activeOrder.totalAmount.toLocaleString()}.\n\n` +
             `👉 Click here to complete your transaction securely:\n${paymentData.authorization_url}\n\n` +
             `Once paid, our checkout system will update your session!`;
    } catch (payError) {
      console.error("❌ CRITICAL CHECKOUT ERROR DETECTED:", payError);
      return `⚠️ Payment gateway service is temporarily delayed. Please try again by typing **PAY**.`;
    }
  }

  const pendingCart = await Order.findOne({ deviceId, status: 'PENDING' });
  const displayTotal = pendingCart ? pendingCart.totalAmount.toLocaleString() : "0";
  return `⚠️ You have an unpaid order pending. Total is ₦${displayTotal}.\n\nType **PAY** to generate your invoice link, or **0** to cancel.`;
}