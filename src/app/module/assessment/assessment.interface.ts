import type { AssessmentAccessType } from "../../../generated/prisma/enums.js";

export interface ICreateAssessmentPayload {
  title: string;
  description?: string;
  accessType?: AssessmentAccessType;
  price?: number;
}

export interface IUpdateAssessmentPayload {
  title?: string;
  description?: string;
  accessType?: AssessmentAccessType;
  price?: number | null;
}

export interface IGetAssessmentsQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  accessType?: AssessmentAccessType;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}