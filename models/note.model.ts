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
  processingStatus: {
    type: String,
    enum: ["uploaded", "extracting", "processing", "completed", "failed"],
    default: "uploaded",
  },
  extractedContent: {
    type: [
      {
        page: {
          type: Number,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  },
  totalPages: {
    type: Number,
    default: 0,
  },
  totalChunks: {
    type: Number,
    default: 0,
  },
  qaCount: {
    type: Number,
    default: 0,
  },
  generatedContent: {
    type: Schema.Types.Mixed,
    required: false,
  },
  creditsUsed: {
    type: Number,
    default: 0,
  },
  failureReason: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export type Note = InferSchemaType<typeof noteSchema>;

const NoteModel = models.Note || model("Note", noteSchema);

export default NoteModel;
