import { type Document, Schema, model } from "mongoose";

export interface IMember extends Document {
	// Discord Member fields
	discord_id: string;
	username: string;
	discriminator: string;
	mentor_score: number;
	joined_at: Date;
	last_active: Date;
}

const MemberSchema = new Schema<IMember>({
	discord_id: { type: String, unique: true, sparse: true },
	username: { type: String },
	discriminator: { type: String },
	mentor_score: { type: Number, default: 0 },
	joined_at: { type: Date, default: Date.now },
	last_active: { type: Date, default: Date.now },
});

export const MemberModel = model<IMember>("Member", MemberSchema);
