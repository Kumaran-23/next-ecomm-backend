import express from 'express'
import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma.js"
import auth from '../middleware/auth.js'
const router = express.Router()

router.post('/', auth, async (req, res) => {
    const data = req.body;


    prisma.image.create({
        data:{
            ...data,
            userId: req.user.payload.id
        }
    }).then(image => {
        return res.json(image);
        
    })
    .catch(err => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {}
      formattedError[`${err.meta.target[0]}`] = 'already taken'

      return res.status(500).send({
        error: formattedError
      });
    }
    throw err
  })
})

router.get("/", async (req, res) => {
  await prisma.image.findMany().then((image) => {
    return res.json(image);
  });
});

router.get("/:id", async (req,res) => {
  const id = parseInt(req.params.id)
  const image = await prisma.image.findUnique({
    where: {
      id: id
    }
  })
  return res.json(image);
})

router.delete('/:id', auth, async (req, res) => {
  const image = await prisma.image.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  })
  console.log(req.user.id)
  console.log(image.userId)
  if (req.user.payload.id != image.userId) {
      return res.status(401).send({"error": "Unauthorized"})
  }
  else {
     await prisma.image.delete({
      where: {
        id: parseInt(req.params.id)
      }
    })
    res.status(200).json({ message: 'Entry deleted successfully.' });
  }
})

export default router;