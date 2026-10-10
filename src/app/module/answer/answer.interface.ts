export interface ISubmitAnswerPayload {
  problemId: string;
  answer:string,
  language: "javascript" | "typescript" | "python" | "java" | "cpp";
  code: string;
  startedAt: Date;
  submittedAt: Date;
}