-- Insert default content section templates
-- These will serve as starting points for users to create their own sections

-- Note: This migration assumes there are existing users in the system
-- The templates will be associated with a system user or can be copied when users create their first section

-- Insert STAR Memo template
INSERT INTO "public"."custom_sections" (
    "id",
    "userId",
    "title",
    "slug",
    "type",
    "description",
    "isPublic",
    "order",
    "layout",
    "content",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    (SELECT "id" FROM "public"."users" LIMIT 1), -- Associate with first user as template owner
    'STAR Memos',
    'star-memos',
    'star-memo',
    'Professional achievements using the STAR method (Situation, Task, Action, Result)',
    true,
    1,
    'timeline',
    '{"type":"star-memo","layout":"timeline","isPublic":true,"order":1,"allowImages":true,"allowCode":false,"maxEntries":10,"fields":["situation","task","action","result"],"entries":[],"template":{"situation":{"label":"Situation","required":true,"type":"textarea"},"task":{"label":"Task","required":true,"type":"textarea"},"action":{"label":"Action","required":true,"type":"textarea"},"result":{"label":"Result","required":true,"type":"textarea"}}}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Project Showcase template
INSERT INTO "public"."custom_sections" (
    "id",
    "userId",
    "title",
    "slug",
    "type",
    "description",
    "isPublic",
    "order",
    "layout",
    "content",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    (SELECT "id" FROM "public"."users" LIMIT 1),
    'Project Showcase',
    'project-showcase',
    'project-showcase',
    'Showcase your technical projects with descriptions, technologies, and outcomes',
    true,
    2,
    'grid',
    '{"type":"project-showcase","layout":"grid","isPublic":true,"order":2,"allowImages":true,"allowCode":true,"maxProjects":6,"fields":["title","description","technologies","outcome","images"],"entries":[],"template":{"title":{"label":"Project Title","required":true,"type":"text"},"description":{"label":"Description","required":true,"type":"textarea"},"technologies":{"label":"Technologies Used","required":false,"type":"tags"},"outcome":{"label":"Outcome/Results","required":true,"type":"textarea"},"images":{"label":"Project Images","required":false,"type":"image-gallery"}}}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Community Engagement template
INSERT INTO "public"."custom_sections" (
    "id",
    "userId",
    "title",
    "slug",
    "type",
    "description",
    "isPublic",
    "order",
    "layout",
    "content",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    (SELECT "id" FROM "public"."users" LIMIT 1),
    'Community Engagement',
    'community-engagement',
    'community-engagement',
    'Highlight your involvement in professional communities, open source, and volunteer work',
    true,
    3,
    'list',
    '{"type":"community-engagement","layout":"list","isPublic":true,"order":3,"allowImages":true,"allowCode":false,"fields":["event","role","date","description","impact"],"entries":[],"template":{"event":{"label":"Event/Organization","required":true,"type":"text"},"role":{"label":"Your Role","required":true,"type":"text"},"date":{"label":"Date","required":true,"type":"date"},"description":{"label":"Description","required":true,"type":"textarea"},"impact":{"label":"Impact/Outcome","required":false,"type":"textarea"}}}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Speaking Engagements template
INSERT INTO "public"."custom_sections" (
    "id",
    "userId",
    "title",
    "slug",
    "type",
    "description",
    "isPublic",
    "order",
    "layout",
    "content",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    (SELECT "id" FROM "public"."users" LIMIT 1),
    'Speaking Engagements',
    'speaking-engagements',
    'speaking-engagements',
    'Document your speaking engagements, presentations, and conference talks',
    true,
    4,
    'timeline',
    '{"type":"speaking-engagements","layout":"timeline","isPublic":true,"order":4,"allowImages":true,"allowCode":false,"fields":["event","title","date","audience","description","slides"],"entries":[],"template":{"event":{"label":"Event/Conference","required":true,"type":"text"},"title":{"label":"Presentation Title","required":true,"type":"text"},"date":{"label":"Date","required":true,"type":"date"},"audience":{"label":"Audience Size","required":false,"type":"text"},"description":{"label":"Description","required":true,"type":"textarea"},"slides":{"label":"Slides/Recording URL","required":false,"type":"url"}}}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Certifications template
INSERT INTO "public"."custom_sections" (
    "id",
    "userId",
    "title",
    "slug",
    "type",
    "description",
    "isPublic",
    "order",
    "layout",
    "content",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    (SELECT "id" FROM "public"."users" LIMIT 1),
    'Certifications',
    'certifications',
    'certifications',
    'Showcase your professional certifications, licenses, and credentials',
    true,
    5,
    'cards',
    '{"type":"certifications","layout":"cards","isPublic":true,"order":5,"allowImages":true,"allowCode":false,"fields":["name","issuer","date","expiry","credentialId","description"],"entries":[],"template":{"name":{"label":"Certification Name","required":true,"type":"text"},"issuer":{"label":"Issuing Organization","required":true,"type":"text"},"date":{"label":"Date Earned","required":true,"type":"date"},"expiry":{"label":"Expiry Date","required":false,"type":"date"},"credentialId":{"label":"Credential ID","required":false,"type":"text"},"description":{"label":"Description","required":false,"type":"textarea"}}}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
