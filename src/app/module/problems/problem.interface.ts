import type { Difficulty, ProblemType } from "../../../generated/prisma/enums.js";

export interface ICreateProblemPayload {
  title: string;
  description: string;
  type: ProblemType;
  difficulty?: Difficulty;
  category: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  timeLimit?: number;
  memoryLimit?: number;
}