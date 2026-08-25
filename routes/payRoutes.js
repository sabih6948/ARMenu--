import { Safepay } from '@sfpy/node-sdk';
import express from 'express';

const router = express.Router();

const safepay = new Safepay({
  environment: 'sandbox',
  apiKey: 'sec_0317238f-8d52-4566-a4ea-dd619e1d0835',
  v1Secret: 'bar',
  webhookSecret: 'foo',
  baseUrl: 'https://sandbox.api.getsafepay.com'
});

router.post('/create-checkout', async (req, res) => {
  const { paymentMethod } = req.body; // e.g., 'card', 'jazzcash', 'easypaisa', 'payfast'

  try {
    // 1. Create token for the transaction via Safepay
    const { token } = await safepay.payments.create({
      amount: 10000,
      currency: 'PKR'
    });

    // 2. Base Safepay checkout URL configuration
    let checkoutUrl = safepay.checkout.create({
      token,
      orderId: 'ORDER_123',
      cancelUrl: 'http://localhost:5505/cancel',
      redirectUrl: 'http://localhost:5505/success',
      source: 'custom',
      webhooks: false
    });

    // 3. Append payment gateway / method specific parameters if supported by Safepay's hosted checkout query strings
    if (paymentMethod === 'jazzcash') {
      checkoutUrl += '&payment_method=jazzcash';
    } else if (paymentMethod === 'easypaisa') {
      checkoutUrl += '&payment_method=easypaisa';
    } else if (paymentMethod === 'card') {
      checkoutUrl += '&payment_method=card';
    }

    res.status(200).json({ checkoutUrl });
  } catch (error) {
    console.error("SAFEPAY ERROR DETAILS:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;