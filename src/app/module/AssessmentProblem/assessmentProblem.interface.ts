export interface CreateAssessmentProblemPayload {
  problemId: string;
  marks: number;
  order: number;
}

export interface UpdateAssessmentProblemPayload {
  marks?: number;
  order?: number;
}