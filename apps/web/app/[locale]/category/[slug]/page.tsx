import { CategoryPage } from '@republik/ui';

export default function CategorySlugPage({ params }: { params: { slug: string, locale?: string } }) {
    return <CategoryPage slug={params.slug} />;
}
