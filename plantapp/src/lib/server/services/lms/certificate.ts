import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export class CertificateService {
	// Template CRUD
	static async createTemplate(data: {
		name: string;
		htmlTemplate: string;
		cssStyles?: string;
		isDefault?: boolean;
		courseId?: string;
	}) {
		const id = randomUUID();
		const [template] = await db
			.insert(lmsTable.lmsCertificateTemplate)
			.values({
				id,
				name: data.name,
				htmlTemplate: data.htmlTemplate,
				cssStyles: data.cssStyles ?? '',
				isDefault: data.isDefault ?? false,
				courseId: data.courseId || null
			})
			.returning();
		return template;
	}

	static async updateTemplate(
		templateId: string,
		data: Partial<{
			name: string;
			htmlTemplate: string;
			cssStyles: string;
			isDefault: boolean;
			courseId: string;
		}>
	) {
		const updates: Record<string, any> = { updatedAt: new Date() };
		if (data.name) updates.name = data.name;
		if (data.htmlTemplate) updates.htmlTemplate = data.htmlTemplate;
		if (data.cssStyles !== undefined) updates.cssStyles = data.cssStyles;
		if (data.isDefault !== undefined) updates.isDefault = data.isDefault;
		if (data.courseId !== undefined) updates.courseId = data.courseId;
		const [updated] = await db
			.update(lmsTable.lmsCertificateTemplate)
			.set(updates)
			.where(eq(lmsTable.lmsCertificateTemplate.id, templateId))
			.returning();
		return updated;
	}

	static async listTemplates(courseId?: string) {
		if (courseId) {
			return db
				.select()
				.from(lmsTable.lmsCertificateTemplate)
				.where(eq(lmsTable.lmsCertificateTemplate.courseId, courseId))
				.orderBy(desc(lmsTable.lmsCertificateTemplate.createdAt));
		}
		return db
			.select()
			.from(lmsTable.lmsCertificateTemplate)
			.orderBy(desc(lmsTable.lmsCertificateTemplate.createdAt));
	}

	static async getTemplateForCourse(courseId: string) {
		// Try course-specific template first, fall back to default
		const [courseTemplate] = await db
			.select()
			.from(lmsTable.lmsCertificateTemplate)
			.where(eq(lmsTable.lmsCertificateTemplate.courseId, courseId))
			.limit(1);
		if (courseTemplate) return courseTemplate;
		const [defaultTemplate] = await db
			.select()
			.from(lmsTable.lmsCertificateTemplate)
			.where(eq(lmsTable.lmsCertificateTemplate.isDefault, true))
			.limit(1);
		return defaultTemplate || null;
	}

	// Render template with variables
	static renderTemplate(
		htmlTemplate: string,
		cssStyles: string | null,
		variables: Record<string, string>
	): string {
		let html = htmlTemplate;
		for (const [key, value] of Object.entries(variables)) {
			// Sanitize value to prevent XSS
			const safe = value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safe);
		}
		if (cssStyles) {
			html = `<style>${cssStyles}</style>${html}`;
		}
		return html;
	}

	// Certificate issuance
	static async issueCertificate(enrollmentId: string) {
		// Check not already issued
		const [existing] = await db
			.select()
			.from(lmsTable.lmsCertificate)
			.where(eq(lmsTable.lmsCertificate.enrollmentId, enrollmentId))
			.limit(1);
		if (existing) return existing;

		// Get enrollment + course + user
		const [enrollment] = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.limit(1);
		if (!enrollment) throw new Error('Enrollment not found');

		const [course] = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, enrollment.courseId))
			.limit(1);

		// Get template
		const template = await this.getTemplateForCourse(enrollment.courseId);
		if (!template) throw new Error('No certificate template available');

		const certUid = randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();

		const [certificate] = await db
			.insert(lmsTable.lmsCertificate)
			.values({
				id: randomUUID(),
				enrollmentId,
				templateId: template.id,
				certificateUid: certUid,
				issuedAt: new Date(),
				metadata: JSON.stringify({ courseTitle: course?.title, courseId: enrollment.courseId })
			})
			.returning();

		return certificate;
	}

	static async getCertificateByUid(uid: string) {
		const [cert] = await db
			.select()
			.from(lmsTable.lmsCertificate)
			.where(eq(lmsTable.lmsCertificate.certificateUid, uid))
			.limit(1);
		return cert || null;
	}

	static async getUserCertificates(userId: string) {
		return db
			.select({
				certificate: lmsTable.lmsCertificate,
				courseTitle: lmsTable.lmsCourse.title,
				courseSlug: lmsTable.lmsCourse.slug
			})
			.from(lmsTable.lmsCertificate)
			.innerJoin(
				lmsTable.lmsEnrollment,
				eq(lmsTable.lmsCertificate.enrollmentId, lmsTable.lmsEnrollment.id)
			)
			.innerJoin(lmsTable.lmsCourse, eq(lmsTable.lmsEnrollment.courseId, lmsTable.lmsCourse.id))
			.where(eq(lmsTable.lmsEnrollment.userId, userId))
			.orderBy(desc(lmsTable.lmsCertificate.issuedAt));
	}
}

export default CertificateService;
