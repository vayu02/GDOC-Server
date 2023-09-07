import { config } from 'dotenv'
config()
import mongoose from 'mongoose'
import { Server as SocketIoServer } from 'socket.io'
import Document from './model/Document.js'
const PORT = process.env.PORT || 6010
const BASE_URL = process.env.BASE_URL

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
  })

const io = new SocketIoServer(PORT, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

const defaultValue = ''

io.on('connection', (socket) => {
  socket.on('get-document', async (documentId) => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit('load-document', document.data)

    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta)
    })

    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
