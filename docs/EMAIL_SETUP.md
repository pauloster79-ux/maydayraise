# Environment Variables for Email Configuration

## Production Environment Variables

Add these to your Vercel deployment settings:

```bash
# Resend API Key (get this from your Resend dashboard)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email sender address (must be verified in Resend)
EMAIL_FROM=info@maydaysaxonvale.co.uk
```

## Local Development (Optional)

If you want to test email sending locally, create a `.env.local` file:

```bash
# Optional: For local testing with Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=info@maydaysaxonvale.co.uk
```

**Note:** Without these variables set locally, the email will be logged to the console instead of being sent, which is useful for development.

## Verifying Your Email Domain in Resend

1. Log in to your Resend dashboard
2. Go to "Domains" and add `maydaysaxonvale.co.uk`
3. Add the DNS records provided by Resend to your domain
4. Wait for verification (usually a few minutes)
5. Once verified, you can send emails from `info@maydaysaxonvale.co.uk`
