'use client';

import { ArticleEditor, withAuth } from '@republik/ui';

function EditArticlePage({ params }: { params: { id: string } }) {
    return <ArticleEditor articleId={params.id} locale="EN" />;
}

export default withAuth(EditArticlePage, 'ADMIN');
