# Stripe Payment Integration Setup

This application includes a complete Stripe payment integration for purchasing credits. Follow these steps to enable payments:

## 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete the account verification process

## 2. Get Your API Keys

1. Log in to your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. For testing, use the test mode keys (they start with `pk_test_` and `sk_test_`)

## 3. Add Environment Variables

Add the following environment variables to your project:

\`\`\`env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
\`\`\`

## 4. Set Up Webhook (for Production)

Webhooks allow Stripe to notify your application when payments are completed:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your environment variables:

\`\`\`env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
\`\`\`

## 5. Test the Integration

### Test Mode (No Real Money)

Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiration date and any 3-digit CVC

### Testing Webhooks Locally

1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Forward webhooks to your local server:
   \`\`\`bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   \`\`\`
4. Use the webhook signing secret provided by the CLI

## 6. Go Live

When ready for production:

1. Complete Stripe account activation
2. Switch to **Live mode** in Stripe Dashboard
3. Get your live API keys (start with `pk_live_` and `sk_live_`)
4. Update environment variables with live keys
5. Set up production webhook endpoint
6. Test with real payment methods

## Credit Packages

The application includes three default credit packages:

- **Starter**: 100 credits for $9.99
- **Pro**: 500 credits for $39.99 (Most Popular)
- **Enterprise**: 1500 credits for $99.99

You can customize these in `lib/db/payments.ts` by modifying the `getDefaultPackages()` function.

## Security Notes

- Never commit API keys to version control
- Always use environment variables for sensitive data
- Use test mode keys during development
- Verify webhook signatures to prevent fraud
- Keep your secret keys secure

## Support

For issues with Stripe integration:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
