import { AssessmentStatus, Role } from "../../../generated/prisma/enums.js";
import type {
	CreateCompanyPayload,
	UpdateCompanyPayload,
} from "./company.interface.js";
declare const createCompany: (
	currentUserId: string,
	currentUserRole: Role,
	payload: CreateCompanyPayload,
) => Promise<{
	companyName: string;
	createdAt: Date;
	description: string | null;
	id: string;
	logo: string | null;
	updatedAt: Date;
	userId: string;
	website: string | null;
}>;
declare const getMyCompany: (userId: string) => Promise<
	{
		_count: {
			assessments: number;
		};
		user: {
			email: string;
			id: string;
			name: string;
			role: Role;
			status: import("../../../generated/prisma/enums.js").UserStatus;
		};
	} & {
		id: string;
		userId: string;
		companyName: string;
		description: string | null;
		website: string | null;
		logo: string | null;
		createdAt: Date;
		updatedAt: Date;
	}
>;
declare const getCompanyById: (companyId: string) => Promise<{
	_count: {
		assessments: number;
	};
	assessments: {
		accessType: import("../../../generated/prisma/enums.js").AssessmentAccessType;
		duration: number;
		id: string;
		passingMarks: number;
		price: import("@prisma/client-runtime-utils").Decimal | null;
		status: AssessmentStatus;
		title: string;
		totalMarks: number;
	}[];
	companyName: string;
	createdAt: Date;
	description: string | null;
	id: string;
	logo: string | null;
	updatedAt: Date;
	website: string | null;
}>;
declare const updateCompany: (
	userId: string,
	userRole: Role,
	companyId: string,
	payload: UpdateCompanyPayload,
) => Promise<{
	companyName: string;
	createdAt: Date;
	description: string | null;
	id: string;
	logo: string | null;
	updatedAt: Date;
	userId: string;
	website: string | null;
}>;
declare const deleteCompany: (
	userId: string,
	userRole: Role,
	companyId: string,
) => Promise<{
	companyName: string;
	id: string;
}>;
export declare const CompanyService: {
	createCompany: typeof createCompany;
	getMyCompany: typeof getMyCompany;
	getCompanyById: typeof getCompanyById;
	updateCompany: typeof updateCompany;
	deleteCompany: typeof deleteCompany;
};
export {};
//# sourceMappingURL=company.service.d.ts.map
