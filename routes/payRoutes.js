import { Safepay } from '@sfpy/node-sdk';
import express from 'express';

const router = express.Router();

const safepay = new Safepay({
  environment: 'sandbox',
  apiKey: process.env.SAFEPAY_API_KEY,
  v1Secret: 'bar',
  webhookSecret: 'foo',
  baseUrl: 'https://sandbox.api.getsafepay.com'
});

router.post('/create-checkout', async (req, res) => {
  const { paymentMethod } = req.body;

  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { token } = await safepay.payments.create({
      amount: 10000,
      currency: 'PKR'
    });

    let checkoutUrl = safepay.checkout.create({
      token,
      orderId: 'ORDER_123',
      cancelUrl: `${baseUrl}/cancel`,
      redirectUrl: `${baseUrl}/success`,
      source: 'custom',
      webhooks: false
    });

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