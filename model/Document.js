import { Schema, model } from 'mongoose'

const DocumentSchema = new Schema({
  _id: String,
  data: Object,
})

export default model('Document', DocumentSchema)
