import { type Document, Schema, type Types, model } from "mongoose";

export interface ICollaboration extends Document {
	question_id: Types.ObjectId;
	mentee_discord_id: string;
	mentor_discord_id: string;
	skill_id: Types.ObjectId;
	skill_level: number;
	mentor_score_increase: number;
	started_at: Date;
	ended_at: Date;
}

const CollaborationSchema = new Schema<ICollaboration>({
	question_id: {
		type: Schema.Types.ObjectId,
		ref: "Question",
		required: true,
	},
	mentee_discord_id: { type: String, required: true },
	mentor_discord_id: { type: String, required: true },
	skill_id: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
	skill_level: { type: Number, required: true },
	mentor_score_increase: { type: Number, required: true },
	started_at: { type: Date, default: Date.now },
	ended_at: { type: Date, default: Date.now },
});

export const CollaborationModel = model<ICollaboration>(
	"Collaboration",
	CollaborationSchema
);
