export interface CreateInvitationPayload {
  assessmentId: string;
  candidateId: string;
  userId: string;
  email: string;
  expiresAt?: Date;
}