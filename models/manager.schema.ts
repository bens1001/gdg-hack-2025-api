import { type Document, Schema, model } from "mongoose";

export interface IManager extends Document {
    email: string;
    password: string;
    roles: string[];
}

const UserSchema = new Schema<IManager>({
    email: { type: String, unique: true, sparse: true, required: true },
    password: { type: String, required: true },
    roles: { type: [String] },
});

export const ManagerModel = model<IManager>("User", UserSchema);
