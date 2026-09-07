import type { Difficulty, ProblemType } from "../../../generated/prisma/enums.js";


interface IMCQOptionPayload {
  text: string;
  isCorrect: boolean;
}

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
  options?: IMCQOptionPayload[];
}



export interface IGetProblemsQuery {
  page?: string;
  limit?: string;
  search?: string;
    title?: string;
  category?: string;
  difficulty?:Difficulty;
  type?:ProblemType;
  sortBy?: "createdAt" | "updatedAt" | "title" | "difficulty" | "category";
  sortOrder?: "asc" | "desc";
}


export interface IUpdateProblemPayload {
  title?: string;
  description?: string;
  type?: ProblemType;
  difficulty?: Difficulty;
  category?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  timeLimit?: number;
  memoryLimit?: number;
}