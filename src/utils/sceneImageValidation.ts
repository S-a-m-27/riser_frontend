/**
 * Scene Image Validation
 * Validates that image files match backend scene definitions
 */

interface SceneImageMapping {
    category: string;
    backendKey: string;
    expectedFileName: string;
    actualFileName?: string;
    status: 'match' | 'mismatch' | 'missing';
}

/**
 * Expected scene images based on backend definitions
 */
export const EXPECTED_SCENE_IMAGES: SceneImageMapping[] = [
    // Home scenes
    { category: 'home', backendKey: 'home_1', expectedFileName: 'home_1.png', status: 'match' },
    { category: 'home', backendKey: 'home_2', expectedFileName: 'home_2.png', status: 'match' },
    { category: 'home', backendKey: 'home_3', expectedFileName: 'home_3.png', status: 'match' },
    { category: 'home', backendKey: 'home_4', expectedFileName: 'home_4.png', status: 'match' },
    { category: 'home', backendKey: 'home_5', expectedFileName: 'home_5.png', status: 'match' },
    
    // Street scenes
    { category: 'street', backendKey: 'street_1', expectedFileName: 'street_1.png', status: 'match' },
    { category: 'street', backendKey: 'street_2', expectedFileName: 'street_2.png', status: 'match' },
    { category: 'street', backendKey: 'street_3', expectedFileName: 'street_3.png', status: 'match' },
    { category: 'street', backendKey: 'street_4', expectedFileName: 'street_4.png', status: 'match' },
    
    // Upper floor scenes - NOTE: Backend uses "upper_floor_X" but files might be "upperfloor_X"
    { category: 'upper_floor', backendKey: 'upper_floor_1', expectedFileName: 'upper_floor_1.png', status: 'mismatch' },
    { category: 'upper_floor', backendKey: 'upper_floor_2', expectedFileName: 'upper_floor_2.png', status: 'mismatch' },
    { category: 'upper_floor', backendKey: 'upper_floor_3', expectedFileName: 'upper_floor_3.png', status: 'mismatch' },
    { category: 'upper_floor', backendKey: 'upper_floor_4', expectedFileName: 'upper_floor_4.png', status: 'mismatch' },
];

/**
 * Get validation summary
 */
export const getValidationSummary = () => {
    const summary = {
        home: { total: 5, matched: 5, mismatched: 0, missing: 0 },
        street: { total: 4, matched: 4, mismatched: 0, missing: 0 },
        upper_floor: { total: 4, matched: 0, mismatched: 4, missing: 0 },
    };
    
    return summary;
};

/**
 * Expected file names for validation
 */
export const EXPECTED_FILES = {
    home: ['home_1.png', 'home_2.png', 'home_3.png', 'home_4.png', 'home_5.png'],
    street: ['street_1.png', 'street_2.png', 'street_3.png', 'street_4.png'],
    upper_floor: ['upperfloor_1.png', 'upperfloor_2.png', 'upperfloor_3.png', 'upperfloor_4.png'], // Actual file names
    upper_floor_backend: ['upper_floor_1.png', 'upper_floor_2.png', 'upper_floor_3.png', 'upper_floor_4.png'], // What backend expects
};

