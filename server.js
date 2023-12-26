require("dotenv").config();
const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

app.use(express.json());
app.use(express.static("public"));

const storeItems = new Map([
  [1, { priceINR: 100000, name: "NodeJS Course" }],
  [2, { priceINR: 200000, name: "React Course" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: req.body.items.map(item=>{
        const storeItem = storeItems.get(item.id);
        return {
            price_data:{
                currency:'inr',
                product_data:{
                    name:storeItem.name,
                },
                unit_amount:storeItem.priceINR
            },
            quantity:item.quantity
        }
      }),
      success_url: `${process.env.SERVER_URL}/success.html`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });
    res.status(200).json({url:session.url});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log("Listening in port 3000");
});
