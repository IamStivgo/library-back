-- Seed roles
INSERT INTO roles (id, name, description) VALUES
    ('role-admin', 'admin', 'Administrator with full access to all resources'),
    ('role-librarian', 'librarian', 'Librarian who can manage books and view reports'),
    ('role-member', 'member', 'Regular member who can browse and borrow books'),
    ('role-guest', 'guest', 'Guest with read-only access')
ON CONFLICT (name) DO NOTHING;

-- Seed permissions
INSERT INTO permissions (id, name, description, resource, action) VALUES
    -- Book permissions
    ('perm-book-create', 'book:create', 'Create new books', 'book', 'create'),
    ('perm-book-read', 'book:read', 'View book details', 'book', 'read'),
    ('perm-book-update', 'book:update', 'Update book information', 'book', 'update'),
    ('perm-book-delete', 'book:delete', 'Delete books', 'book', 'delete'),
    ('perm-book-checkout', 'book:checkout', 'Check out books', 'book', 'checkout'),
    ('perm-book-checkin', 'book:checkin', 'Check in books', 'book', 'checkin'),
    ('perm-book-search', 'book:search', 'Search books', 'book', 'search'),
    
    -- User permissions
    ('perm-user-create', 'user:create', 'Create new users', 'user', 'create'),
    ('perm-user-read', 'user:read', 'View user details', 'user', 'read'),
    ('perm-user-update', 'user:update', 'Update user information', 'user', 'update'),
    ('perm-user-delete', 'user:delete', 'Delete users', 'user', 'delete'),
    ('perm-user-list', 'user:list', 'List all users', 'user', 'list'),
    
    -- Role and permission management
    ('perm-role-manage', 'role:manage', 'Manage roles and permissions', 'role', 'manage'),
    
    -- AI features permissions
    ('perm-ai-chat', 'ai:chat', 'Use AI chat assistant', 'ai', 'chat'),
    ('perm-ai-recommendations', 'ai:recommendations', 'Get AI book recommendations', 'ai', 'recommendations'),
    ('perm-ai-summary', 'ai:summary', 'Generate book summaries with AI', 'ai', 'summary'),
    
    -- Audit permissions
    ('perm-audit-read', 'audit:read', 'View audit logs', 'audit', 'read')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to admin role (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-admin', id FROM permissions
ON CONFLICT DO NOTHING;

-- Assign permissions to librarian role
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('role-librarian', 'perm-book-create'),
    ('role-librarian', 'perm-book-read'),
    ('role-librarian', 'perm-book-update'),
    ('role-librarian', 'perm-book-delete'),
    ('role-librarian', 'perm-book-checkout'),
    ('role-librarian', 'perm-book-checkin'),
    ('role-librarian', 'perm-book-search'),
    ('role-librarian', 'perm-user-read'),
    ('role-librarian', 'perm-user-list'),
    ('role-librarian', 'perm-ai-chat'),
    ('role-librarian', 'perm-ai-recommendations'),
    ('role-librarian', 'perm-ai-summary')
ON CONFLICT DO NOTHING;

-- Assign permissions to member role
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('role-member', 'perm-book-read'),
    ('role-member', 'perm-book-search'),
    ('role-member', 'perm-book-checkout'),
    ('role-member', 'perm-user-read'),
    ('role-member', 'perm-ai-chat'),
    ('role-member', 'perm-ai-recommendations')
ON CONFLICT DO NOTHING;

-- Assign permissions to guest role
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('role-guest', 'perm-book-read'),
    ('role-guest', 'perm-book-search')
ON CONFLICT DO NOTHING;

-- Create default admin user (password: Admin123!)
INSERT INTO users (id, email, username, password_hash, full_name, is_active, email_verified) VALUES
    ('user-admin-default', 'admin@luminaledger.com', 'admin', '$2a$10$8K1p/a0dL3LKziBNW4xbMOc8wd3znqPk0S3KZ1Z4s4qZ2X9qK0vNK', 'System Administrator', true, true)
ON CONFLICT (email) DO NOTHING;

-- Assign admin role to default admin user
INSERT INTO user_roles (user_id, role_id) VALUES
    ('user-admin-default', 'role-admin')
ON CONFLICT DO NOTHING;
