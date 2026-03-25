-- Add book:checkin permission to member role so users can return their own books
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('role-member', 'perm-book-checkin')
ON CONFLICT DO NOTHING;
