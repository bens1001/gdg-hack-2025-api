import { type Document, Schema, type Types, model } from "mongoose";

export interface IQuestion extends Document {
	discord_id: string;
	question_text: string;
	skill: string;
	asked_at: Date;
	answered: boolean;
	collaboration_id?: Types.ObjectId;
}

const QuestionSchema = new Schema<IQuestion>({
	discord_id: { type: String, required: true },
	question_text: { type: String, required: true },
	skill: { type: String, required: true },
	asked_at: { type: Date, default: Date.now },
	answered: { type: Boolean, default: false },
	collaboration_id: {
		type: Schema.Types.ObjectId,
		ref: "Collaboration",
		default: null,
	},
});

export const QuestionModel = model<IQuestion>("Question", QuestionSchema);
