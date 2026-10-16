-- ==============================================================================
-- DecisionHub Production PostgreSQL Initialization Script
-- Auto-executed on container initialization in /docker-entrypoint-initdb.d/
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Communities Table
CREATE TABLE IF NOT EXISTS communities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(2000),
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON communities(owner_id);

-- 3. Community Memberships Table
CREATE TABLE IF NOT EXISTS community_memberships (
    id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_community_member UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comm_memberships_user ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_comm_memberships_comm ON community_memberships(community_id);

-- 4. Community Invitations Table
CREATE TABLE IF NOT EXISTS community_invitations (
    id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    invitee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inviter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_comm_invitation UNIQUE (community_id, invitee_id, status)
);

CREATE INDEX IF NOT EXISTS idx_comm_invitations_invitee ON community_invitations(invitee_id, status);

-- 5. Decisions Table
CREATE TABLE IF NOT EXISTS decisions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    visibility VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    poll_type VARCHAR(50) NOT NULL DEFAULT 'SINGLE_CHOICE',
    allow_anonymous_voting BOOLEAN NOT NULL DEFAULT FALSE,
    closed BOOLEAN NOT NULL DEFAULT FALSE,
    community_id BIGINT REFERENCES communities(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decisions_community_id ON decisions(community_id);
CREATE INDEX IF NOT EXISTS idx_decisions_visibility ON decisions(visibility);
CREATE INDEX IF NOT EXISTS idx_decisions_category ON decisions(category);
CREATE INDEX IF NOT EXISTS idx_decisions_created_by ON decisions(created_by);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at DESC);

-- 6. Options Table
CREATE TABLE IF NOT EXISTS options (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pros TEXT,
    cons TEXT,
    cost_score INTEGER,
    benefits_score INTEGER,
    risk_score INTEGER,
    time_score INTEGER,
    convenience_score INTEGER
);

CREATE INDEX IF NOT EXISTS idx_options_decision_id ON options(decision_id);

-- 7. Votes Table
CREATE TABLE IF NOT EXISTS votes (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    option_id BIGINT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    voter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER,
    anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_vote_decision_option_user UNIQUE (decision_id, option_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_decision ON votes(decision_id);
CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_id);

-- 8. Comments Table (Decision Threaded Discussion)
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    community_id BIGINT REFERENCES communities(id) ON DELETE SET NULL,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    content VARCHAR(3000) NOT NULL,
    reaction_count BIGINT NOT NULL DEFAULT 0,
    hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_decision ON comments(decision_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- 9. Discussions Table (Global Forum)
CREATE TABLE IF NOT EXISTS discussions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content VARCHAR(5000) NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discussions_author ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);

-- 10. Discussion Comments Table
CREATE TABLE IF NOT EXISTS discussion_comments (
    id BIGSERIAL PRIMARY KEY,
    discussion_id BIGINT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES discussion_comments(id) ON DELETE CASCADE,
    content VARCHAR(3000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disc_comments_discussion ON discussion_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_disc_comments_parent ON discussion_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_disc_comments_author ON discussion_comments(author_id);

-- 11. Suggestions Table
CREATE TABLE IF NOT EXISTS suggestions (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(3000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suggestions_decision ON suggestions(decision_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_author ON suggestions(author_id);

-- 12. Feedback Entries Table
CREATE TABLE IF NOT EXISTS feedback_entries (
    id BIGSERIAL PRIMARY KEY,
    message VARCHAR(3000) NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision_id BIGINT REFERENCES decisions(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_author ON feedback_entries(author_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_entries(status);

-- 13. Reports Table (Moderation)
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision_id BIGINT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES comments(id) ON DELETE SET NULL,
    reason VARCHAR(2000) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_reporter_decision UNIQUE (reporter_id, decision_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_decision ON reports(decision_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    message VARCHAR(2000) NOT NULL,
    decision_id BIGINT REFERENCES decisions(id) ON DELETE SET NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, read_at) WHERE read_at IS NULL;

-- 15. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- 16. Attachments Table (File & Media Service: AWS S3 / Cloudinary / Local Storage)
CREATE TABLE IF NOT EXISTS attachments (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    storage_key VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL DEFAULT 'DOCUMENT',
    decision_id BIGINT REFERENCES decisions(id) ON DELETE CASCADE,
    option_id BIGINT REFERENCES options(id) ON DELETE CASCADE,
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attachments_decision ON attachments(decision_id);
CREATE INDEX IF NOT EXISTS idx_attachments_option ON attachments(option_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Ensure image_url columns exist on decisions and options
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS image_url VARCHAR(1000);
ALTER TABLE options ADD COLUMN IF NOT EXISTS image_url VARCHAR(1000);

-- 17. FCM Tokens Table (Firebase Cloud Messaging - Push Notifications)
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_type VARCHAR(50) NOT NULL DEFAULT 'WEB',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(token);

-- Ensure bio and avatar_url columns exist on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(1000);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- 18. User Interests Table (Module 2: User Category Preferences)
CREATE TABLE IF NOT EXISTS user_interests (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);

-- 19. Saved Decisions Table (Module 2: Bookmarks)
CREATE TABLE IF NOT EXISTS saved_decisions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision_id BIGINT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_saved_decision UNIQUE (user_id, decision_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_decisions_user ON saved_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_decisions_decision ON saved_decisions(decision_id);

-- 20. Decision Custom Criteria Table (Module 4: User-Defined Comparison Criteria)
CREATE TABLE IF NOT EXISTS decision_custom_criteria (
    decision_id BIGINT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    criterion_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (decision_id, criterion_name)
);

CREATE INDEX IF NOT EXISTS idx_decision_custom_criteria_decision ON decision_custom_criteria(decision_id);

-- 21. Option Custom Criteria Scores Table
CREATE TABLE IF NOT EXISTS option_custom_scores (
    option_id BIGINT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    criterion_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    PRIMARY KEY (option_id, criterion_name)
);

CREATE INDEX IF NOT EXISTS idx_option_custom_scores_option ON option_custom_scores(option_id);
