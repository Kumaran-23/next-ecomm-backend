import express from 'express';
import Stripe from 'stripe'
import prisma from "../utils/prisma.js"
const router = express.Router()

const stripe = new Stripe ('sk_test_51NN9YnAGQzkLMn0eB7Jb1HaWe6jkVW9xqeKmDs9j8ggPLOiCjHqjIdG8RBAWZq2qUlUNKx0j2D5VPfK0KEOQEgQ5009MSWNJLM')

router.post('/', async (req, res) => {
  
  const id = req.body
  const image = await prisma.image.findUnique ({
    where : {
      id : id.id
    }
  })
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: image.title,
            description: image.discription,
            images: [image.url
            ]
          },
          unit_amount: (image.price),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:5173/',
    cancel_url: `http://localhost:5173/images/${image.id}`,
  });
  return res.json(session.url)
});

export default router