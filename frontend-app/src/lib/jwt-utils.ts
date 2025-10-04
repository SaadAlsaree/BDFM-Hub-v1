import { decodeJwt } from 'jose';

/**
 * Verifies a JWT token and extracts its payload
 * @param token The JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyToken(token?: string): any | null {
    if (!token) return null;

    try {
        // Decode token without verification (client-side only)
        const decoded = decodeJwt(token);

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            console.error('Token has expired');
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

/**
 * Extracts user roles from a JWT token
 * @param token The JWT token
 * @returns Array of user roles or empty array if none found
 */
export function getRolesFromToken(token?: string): string[] {
    const decoded = verifyToken(token);

    if (!decoded) return [];

    // Extract roles from the token - adjust these based on your actual JWT structure
    // Common claims for roles include 'roles', 'role', or custom claims
    const roles = decoded.roles || decoded.role || [];

    return Array.isArray(roles) ? roles : [roles].filter(Boolean);
}

/**
 * Checks if the user has a specific role
 * @param token The JWT token
 * @param roleName The role name to check
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(token?: string, roleName?: string): boolean {
    if (!roleName) return false;

    const roles = getRolesFromToken(token);
    return roles.includes(roleName);
}

/**
 * Checks if the user has any of the specified roles
 * @param token The JWT token
 * @param roleNames Array of role names to check
 * @returns True if the user has any of the roles, false otherwise
 */
export function hasAnyRole(token?: string, roleNames: string[] = []): boolean {
    if (!roleNames.length) return false;

    const roles = getRolesFromToken(token);
    return roleNames.some(role => roles.includes(role));
} 