// Application-wide role constants
// Single source of truth — avoids magic strings scattered across codebase

export const ROLES = Object.freeze({
    USER: 'user',
    ADMIN: 'admin',
});

export const ALL_ROLES = Object.values(ROLES);
