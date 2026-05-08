import Stripe from "stripe";
import User from "../models/User.js";


export async function createCheckoutSession(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "GeoQuiz Junior Premium",
              description: "Otključajte sve razrede",
            },
            unit_amount: 1000, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?canceled=true`,
      customer_email: req.user.email,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function verifyPremium(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, message: "Session ID nedostaje." });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Plaćanje nije izvršeno." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "Korisnik nije pronađen." });

    user.isPremium = true;
    await user.save();

    res.json({ success: true, message: "Uspešno ste postali Premium korisnik!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}