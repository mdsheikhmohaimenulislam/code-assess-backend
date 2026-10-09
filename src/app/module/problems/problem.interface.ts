import type { Difficulty } from "../../../generated/prisma/enums.js";

export interface ICreateProblemPayload {
  title: string;
  description: string;
  answer: string;
  marks?: number;
  difficulty?: Difficulty;
  category: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  timeLimit?: number;
  memoryLimit?: number;
  isPaid?: boolean;
  price?: number;
}

export interface IGetProblemsQuery {
  page?: string;
  limit?: string;
  search?: string;
  title?: string;
  category?: string;
  difficulty?: Difficulty;
  sortBy?: "createdAt" | "updatedAt" | "title" | "difficulty" | "category";
  sortOrder?: "asc" | "desc";
}

export interface IUpdateProblemPayload {
  title?: string;
  description?: string;
  answer?: string;
  marks?: number;
  difficulty?: Difficulty;
  category?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  timeLimit?: number;
  memoryLimit?: number;
    isPaid?: boolean;
  price?: number;
}