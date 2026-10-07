export interface CreateCompanyPayload {
	userId?: string;
	companyName: string;
	description?: string;
	website?: string;
	logo?: string;
}

export interface UpdateCompanyPayload {
	companyName?: string;
	description?: string;
	website?: string;
	logo?: string;
}


export interface GetAllCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
