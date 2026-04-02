/**
 * Formats service data for display
 * Handles: JSON strings, arrays, objects, and plain strings
 * @param {*} service - The service data to format
 * @returns {string} Formatted service string, never [object Object]
 */
function formatService(service) {
    if (!service) return '';
    
    // If it's already a string
    if (typeof service === 'string') {
        // Try to parse as JSON
        try {
            const parsed = JSON.parse(service);
            if (Array.isArray(parsed)) {
                // Array of service objects or strings
                return parsed.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return item.name || item.service || JSON.stringify(item);
                    }
                    return String(item);
                }).join(', ');
            } else if (typeof parsed === 'object' && parsed !== null) {
                // Single service object
                return parsed.name || parsed.service || JSON.stringify(parsed);
            } else {
                // Parsed to primitive (string, number, etc.)
                return String(parsed);
            }
        } catch (e) {
            // Not valid JSON, return as is
            return service;
        }
    }
    
    // If it's an array
    if (Array.isArray(service)) {
        return service.map(item => {
            if (typeof item === 'object' && item !== null) {
                return item.name || item.service || JSON.stringify(item);
            }
            return String(item);
        }).join(', ');
    }
    
    // If it's an object
    if (typeof service === 'object') {
        return service.name || service.service || JSON.stringify(service);
    }
    
    // Default: convert to string
    return String(service);
}

module.exports = formatService;
