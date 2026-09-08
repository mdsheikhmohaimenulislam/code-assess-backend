export interface CreateTestCasePayload {
	input: string;
	expectedOutput: string;
	isHidden?: boolean;
}

export interface UpdateTestCasePayload {
	input?: string;
	expectedOutput?: string;
	isHidden?: boolean;
}
