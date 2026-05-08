import { Schema, model, models, type InferSchemaType } from "mongoose";

const noteSchema = new Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  fileUrls: {
    type: [String],
    required: true,
    validate: {
      validator: (urls: string[]) => urls.length > 0,
      message: "At least one file URL is required.",
    },
  },
  fileType: {
    type: String,
    enum: ["pdf", "image"],
    required: true,
  },
  qaCount: {
    type: Number,
    default: 0,
  },
  generatedContent: {
    type: Schema.Types.Mixed,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export type Note = InferSchemaType<typeof noteSchema>;

const NoteModel = models.Note || model("Note", noteSchema);

export default NoteModel;
