# Westover Heights Medical Forum Platform

A HIPAA-compliant medical Q&A platform that enables secure, anonymous communication between patients and medical professionals. The platform supports both web and mobile interfaces, allowing users to view public discussions and submit private paid questions to receive expert medical guidance.

## 🌟 Key Features

### Privacy & Security
- 🔒 HIPAA-compliant infrastructure and data handling
- 🎭 Anonymous public posting system
- 🗑️ User data self-deletion capabilities
- 📜 Audit logging for compliance
- 🔐 Secure authentication and authorization

### Forum Features
- 👀 Public forum viewing without registration
- 💰 $25 per question with two follow-up questions
- 📝 Rich text editor for question submission
- 👨‍⚕️ Dedicated admin interface for medical professional responses
- 🔍 Searchable knowledge base
- 📱 Responsive design for all devices

### Payment System
- 💳 Secure payment processing
- 🔄 Automated question credit system
- 📊 Transaction tracking and reporting

## 🏗️ Tech Stack

### Frontend
- React.js with Next.js for SSR
- Tailwind CSS for styling
- Redux Toolkit for state management
- TypeScript for type safety

### Backend
- Node.js with Express.js
- MongoDB with encryption at rest
- JWT for secure authentication
- Socket.IO for real-time updates

### Security & Compliance
- HIPAA-compliant data storage
- End-to-end encryption
- Regular security audits
- Data anonymization protocols

### Payment Processing
- Stripe integration
- PCI-compliant payment handling
- Secure payment token system

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn
- Stripe account
- SSL certificates
- HIPAA-compliant hosting environment

### Installation

1. Clone the repository

## Stripe Configuration

This application uses Stripe for payment processing. It's configured to use:

- **Test keys** in development environments (`NODE_ENV !== 'production'`)
- **Live keys** in production environments (`NODE_ENV === 'production'`)

### Environment Variables

You need to set up the following environment variables:

```
# Test keys (for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key

# Live keys (for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_your_live_key
STRIPE_SECRET_KEY_LIVE=sk_live_your_live_key
```

### Testing Payments

In development mode, you can use Stripe test cards to simulate payments:

- Success: `4242 4242 4242 4242`
- Authentication Required: `4000 0027 6000 3184`
- Decline: `4000 0000 0000 0002`

Use any future expiration date and any 3-digit CVC code.

### Production Payments

In production, real credit cards will be charged. Make sure you have properly set up your Stripe account and webhook endpoints.
