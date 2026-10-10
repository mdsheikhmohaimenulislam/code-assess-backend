// src/lib/judge0.ts

type Judge0Status = {
  id: number;
  description: string;
};

type Judge0Response = {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: Judge0Status;
};

const languageIds: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
};

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = process.env.JUDGE0_AUTH_TOKEN;

  if (token) {
    headers["X-Auth-Token"] = token;
  }

  return headers;
};

const getApiUrl = (): string => {
  return (
    process.env.JUDGE0_API_URL?.replace(/\/$/, "") ||
    "https://ce.judge0.com"
  );
};

export const runCode = async (
  code: string,
  language: string,
  input: string,
): Promise<Judge0Response> => {
  const languageId = languageIds[language.toLowerCase()];

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const createResponse = await fetch(
    `${getApiUrl()}/submissions?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: input,
        cpu_time_limit: 2,
        memory_limit: 128000,
      }),
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!createResponse.ok) {
    throw new Error(
      `Judge0 submission failed: ${createResponse.status}`,
    );
  }

  const created =
    (await createResponse.json()) as Judge0Response;

  if (!created.token) {
    throw new Error("Judge0 did not return a submission token");
  }

  // Judge0 executes asynchronously. Poll until execution finishes.
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });

    const resultResponse = await fetch(
      `${getApiUrl()}/submissions/${created.token}?base64_encoded=false`,
      {
        method: "GET",
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!resultResponse.ok) {
      throw new Error(
        `Judge0 result request failed: ${resultResponse.status}`,
      );
    }

    const result =
      (await resultResponse.json()) as Judge0Response;

    const statusId = result.status?.id;

    // 1 = In Queue, 2 = Processing
    if (statusId !== undefined && statusId > 2) {
      return result;
    }
  }

  throw new Error("Code execution timed out while waiting for Judge0");
};