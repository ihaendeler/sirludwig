type EnvRecord = Record<string, unknown>;

function readString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function readEnvVar(env: EnvRecord, key: string): string {
	const fromBinding = readString(env[key]);
	if (fromBinding) return fromBinding;

	const processEnv = (globalThis as { process?: { env?: EnvRecord } }).process?.env;
	return readString(processEnv?.[key]);
}
