# 🍔 Byte-to-Bite (Byte-to-Bite Core)

Byte-to-Bite is a session-based restaurant chatbot API built with Node.js and TypeScript. It utilizes a state machine pattern to manage automated food orders via a text interface, using device tracking instead of traditional user logins.Features include dynamic menu selection, automated cart management, state validation, and secure Paystack payment integration.
 

## ✨ Key Features
* **Automated State Machine:** Tracks user progression through the ordering flow seamlessly.
* **Session Management:** Identifies and tracks users via unique device IDs without requiring accounts.
* **Dynamic Cart:** Automated cart management and menu selection.
* **Secure Payments:** Fully integrated Paystack webhook pipeline for real-time order verification.
* **Real-Time UI Updates:** Automated polling engine to instantly update the frontend upon payment completion.

## 🛠 Tech Stack
* **Backend:** Node.js, Express, TypeScript
* **Database:** MongoDB (Mongoose)
* **Payment Gateway:** Paystack
* **Frontend:** Next.js, React, Tailwind CSS

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [Git](https://git-scm.com/)
* A MongoDB instance (local or MongoDB Atlas)
* A [Paystack](https://paystack.com/) account for API keys

# 1. Clone the Repository
```bash
git clone [https://github.com/your-username/byte-to-bite.git](https://github.com/your-username/byte-to-bite.git)
cd byte-to-bite
```

# 2. Backend Setup
Open a terminal and set up the Express API:
```
Bash
# Install dependencies
npm install

# Create your environment file
cp .env.example .env

```
## Configure Backend Environment Variables (.env):
~~~
PORT=3000
MONGO_URI=your_mongodb_connection_string
PAYSTACK_SECRET_KEY=your_paystack_test_secret_key
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/payments/webhook
~~~
## Start the Backend Server:
~~~
# Run in development mode
npm run dev
~~~

The backend should now be running on `http://localhost:3000`

# 3. Frontend Setup
Open a new, separate terminal tab and set up the Next.js frontend:
~~~
# Navigate to the frontend directory
cd byte-to-bite-frontend

# Install dependencies
npm install

# Create your frontend environment file
cp .env.local.example .env.local
~~~

## Configure Frontend Environment Variables (`.env.local`):

`NEXT_PUBLIC_API_URL=http://localhost:3000/api`

## Start the Frontend Server:
~~~
# Run the Next.js app
npm run dev
~~~
The frontend should now be running on `http://localhost:3001` (or 3000 if backend is on a different port).

# 🧪 Testing the Webhook Locally
To test the Paystack payment flow locally without a live domain, you can simulate a successful payment using Postman:

1. Initialize an order via the Chat UI.
2. Send a `POST` request to `http://localhost:3000/api/payments/webhook`.
3. Include the Paystack payload containing the `deviceId` in the `metadata` object.
4. The Next.js UI will automatically poll and display the success message!


