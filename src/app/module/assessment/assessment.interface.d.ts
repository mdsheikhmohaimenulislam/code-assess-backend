import { AssessmentAccessType } from "../../../generated/prisma/enums.js";
export interface ICreateAssessmentPayload {
	title: string;
	description?: string;
	duration: number;
	startTime?: Date;
	endTime?: Date;
	totalMarks: number;
	passingMarks: number;
	accessType?: AssessmentAccessType;
	price?: number;
	companyId: string;
}
export interface UpdateAssessmentPayload {
	title?: string;
	description?: string;
	duration?: number;
	startTime?: Date;
	endTime?: Date;
	totalMarks?: number;
	passingMarks?: number;
	accessType?: AssessmentAccessType;
	price?: number | null;
}
//# sourceMappingURL=assessment.interface.d.ts.map
