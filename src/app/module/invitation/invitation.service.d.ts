import {
	AssessmentStatus,
	InvitationStatus,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums.js";
import type { CreateInvitationPayload } from "./invitation.interface.js";
declare const createInvitation: (
	userId: string,
	userRole: Role,
	payload: CreateInvitationPayload,
) => Promise<{
	assessment: {
		duration: number;
		endTime: Date | null;
		id: string;
		startTime: Date | null;
		status: AssessmentStatus;
		title: string;
	};
	assessmentId: string;
	candidate: {
		id: string;
		userId: string;
		phone: string | null;
		bio: string | null;
		githubUrl: string | null;
		linkedinUrl: string | null;
		resumeUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
	};
	candidateId: string;
	createdAt: Date;
	email: string;
	expiresAt: Date | null;
	id: string;
	status: InvitationStatus;
	user: {
		email: string;
		id: string;
		name: string;
	};
	userId: string;
}>;
declare const getInvitations: (
	userId: string,
	userRole: Role,
	query: Record<string, unknown>,
) => Promise<{
	data: {
		assessment: {
			description: string | null;
			duration: number;
			endTime: Date | null;
			id: string;
			startTime: Date | null;
			status: AssessmentStatus;
			title: string;
		};
		assessmentId: string;
		candidate: {
			bio: string | null;
			githubUrl: string | null;
			id: string;
			linkedinUrl: string | null;
			phone: string | null;
			resumeUrl: string | null;
			userId: string;
		};
		candidateId: string;
		createdAt: Date;
		email: string;
		expiresAt: Date | null;
		id: string;
		status: InvitationStatus;
		updatedAt: Date;
		user: {
			email: string;
			id: string;
			name: string;
			role: Role;
			status: UserStatus;
		};
		userId: string;
	}[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}>;
declare const getInvitationById: (
	userId: string,
	userRole: Role,
	invitationId: string,
) => Promise<
	{
		assessment: {
			company: {
				companyName: string;
				id: string;
				userId: string;
			};
			description: string | null;
			duration: number;
			endTime: Date | null;
			id: string;
			startTime: Date | null;
			status: AssessmentStatus;
			title: string;
		};
		candidate: {
			bio: string | null;
			githubUrl: string | null;
			id: string;
			linkedinUrl: string | null;
			phone: string | null;
			resumeUrl: string | null;
			userId: string;
		};
		user: {
			email: string;
			id: string;
			name: string;
			role: Role;
			status: UserStatus;
		};
	} & {
		id: string;
		assessmentId: string;
		candidateId: string;
		userId: string;
		email: string;
		status: InvitationStatus;
		expiresAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}
>;
declare const acceptInvitation: (
	userId: string,
	invitationId: string,
) => Promise<{
	assessment: {
		duration: number;
		endTime: Date | null;
		id: string;
		startTime: Date | null;
		status: AssessmentStatus;
		title: string;
	};
	assessmentId: string;
	candidateId: string;
	createdAt: Date;
	email: string;
	expiresAt: Date | null;
	id: string;
	status: InvitationStatus;
	updatedAt: Date;
	userId: string;
}>;
declare const rejectInvitation: (
	userId: string,
	invitationId: string,
) => Promise<{
	assessmentId: string;
	candidateId: string;
	createdAt: Date;
	email: string;
	expiresAt: Date | null;
	id: string;
	status: InvitationStatus;
	updatedAt: Date;
	userId: string;
}>;
declare const deleteInvitation: (
	userId: string,
	userRole: Role,
	invitationId: string,
) => Promise<void>;
export declare const InvitationService: {
	createInvitation: typeof createInvitation;
	getInvitations: typeof getInvitations;
	getInvitationById: typeof getInvitationById;
	acceptInvitation: typeof acceptInvitation;
	rejectInvitation: typeof rejectInvitation;
	deleteInvitation: typeof deleteInvitation;
};
export {};
//# sourceMappingURL=invitation.service.d.ts.map
