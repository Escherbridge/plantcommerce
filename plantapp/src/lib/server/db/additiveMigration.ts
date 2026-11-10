/** Drop comments and transaction wrappers so the startup runner can apply the file inside one transaction. */
export function executableMigrationSql(source: string): string {
	return source
		.split('\n')
		.filter((line) => !/^\s*--/.test(line))
		.join('\n')
		.replace(/\bBEGIN\s*;/gi, '')
		.replace(/\bCOMMIT\s*;/gi, '')
		.trim();
}
