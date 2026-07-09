// api/create-order.js
export default async function handler(req, res) {
  const body = req.body; // JSON.parse ki zaroorat nahi
  // ...razorpay order create (same logic)...
  return res.status(200).json(order);
}
