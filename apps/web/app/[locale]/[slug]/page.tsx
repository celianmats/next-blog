import { ArticleDetail } from '@republik/ui';

export default function ArticlePage({ params }: { params: { slug: string, locale?: string } }) {
    return <ArticleDetail slug={params.slug} />;
}
