import { Role, UserStatus } from "../../../generated/prisma/enums.js";
import type {
	CreateCandidatePayload,
	UpdateCandidatePayload,
} from "./candidate.interface.js";
declare const createCandidate: (
	userId: string,
	payload: CreateCandidatePayload,
) => Promise<
	{
		user: {
			email: string;
			id: string;
			name: string;
			role: Role;
		};
	} & {
		id: string;
		userId: string;
		phone: string | null;
		bio: string | null;
		githubUrl: string | null;
		linkedinUrl: string | null;
		resumeUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
	}
>;
declare const getMyCandidate: (userId: string) => Promise<
	{
		_count: {
			attempts: number;
			invitations: number;
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
		userId: string;
		phone: string | null;
		bio: string | null;
		githubUrl: string | null;
		linkedinUrl: string | null;
		resumeUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
	}
>;
declare const getCandidateById: (candidateId: string) => Promise<
	{
		_count: {
			attempts: number;
			invitations: number;
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
		userId: string;
		phone: string | null;
		bio: string | null;
		githubUrl: string | null;
		linkedinUrl: string | null;
		resumeUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
	}
>;
declare const updateCandidate: (
	userId: string,
	candidateId: string,
	payload: UpdateCandidatePayload,
) => Promise<
	{
		user: {
			email: string;
			id: string;
			name: string;
			role: Role;
			status: UserStatus;
		};
	} & {
		id: string;
		userId: string;
		phone: string | null;
		bio: string | null;
		githubUrl: string | null;
		linkedinUrl: string | null;
		resumeUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
	}
>;
declare const deleteCandidate: (
	userId: string,
	candidateId: string,
) => Promise<{
	id: string;
	deleted: boolean;
}>;
export declare const CandidateService: {
	createCandidate: typeof createCandidate;
	getMyCandidate: typeof getMyCandidate;
	getCandidateById: typeof getCandidateById;
	updateCandidate: typeof updateCandidate;
	deleteCandidate: typeof deleteCandidate;
};
export {};
//# sourceMappingURL=candidate.service.d.ts.map
