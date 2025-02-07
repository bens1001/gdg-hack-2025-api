import { type Document, Schema, model } from "mongoose";

export interface IUser extends Document {
    discord_id: string;
    username: string;
    discriminator: string;
    mentor_score: number;
    joined_at: Date;
    last_active: Date;
    roles: string[];
}

const UserSchema = new Schema<IUser>({
    discord_id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    discriminator: { type: String, required: true },
    mentor_score: { type: Number, default: 0 },
    joined_at: { type: Date, default: Date.now },
    last_active: { type: Date, default: Date.now },
    roles: { type: [String], default: [] },
});

export const UserModel = model<IUser>("User", UserSchema);
