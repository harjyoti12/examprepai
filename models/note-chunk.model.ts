import { Schema, model, models, type InferSchemaType } from "mongoose";

const noteChunkSchema = new Schema({
  noteId: {
    type: Schema.Types.ObjectId,
    ref: "Note",
    required: true,
    index: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  pageStart: {
    type: Number,
    required: true,
  },
  pageEnd: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  wordCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Keeps one stable ordered chunk set per note for scalable PDF AI generation.
noteChunkSchema.index({ noteId: 1, chunkIndex: 1 }, { unique: true });

export type NoteChunk = InferSchemaType<typeof noteChunkSchema>;

const NoteChunkModel = models.NoteChunk || model("NoteChunk", noteChunkSchema);

export default NoteChunkModel;
