import { Schema, model, Document } from "mongoose";

export interface ISkillLevel {
  level: number;
  score_increment: number;
  description: string;
}

export interface ISkill extends Document {
  name: string;
  description: string;
  levels: ISkillLevel[];
}

const SkillLevelSchema = new Schema<ISkillLevel>({
  level: { type: Number, required: true },
  score_increment: { type: Number, required: true },
  description: { type: String, required: true },
});

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  levels: { type: [SkillLevelSchema], required: true },
});

export const SkillModel = model<ISkill>("Skill", SkillSchema);
