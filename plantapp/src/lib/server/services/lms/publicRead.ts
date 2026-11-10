export function isPubliclyReadableCourse(course: {
	status: string;
	pricingType: string;
	price: string | null;
}): boolean {
	if (course.status !== 'published') return false;
	if (course.pricingType === 'free') return true;
	return !course.price || course.price === '0' || course.price === '0.00';
}

export function publishedCurriculumView<
	TModule extends { isPublished: boolean; lessons: Array<{ isPublished: boolean }> }
>(curriculum: { modules: TModule[] }): { modules: TModule[] } {
	return {
		modules: curriculum.modules
			.filter((module) => module.isPublished)
			.map((module) => ({
				...module,
				lessons: module.lessons.filter((lesson) => lesson.isPublished)
			}))
	};
}
