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

export function readFirstEnvVar(env: EnvRecord, keys: string[]): string {
	for (const key of keys) {
		const value = readEnvVar(env, key);
		if (value) return value;
	}

	return '';
}
