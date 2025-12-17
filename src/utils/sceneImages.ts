/**
 * Scene Image Mapping
 * Maps scene image keys to actual image paths
 * 
 * Images should be placed in: public/images/simulation/
 * Structure:
 * - home/
 *   - home_1.jpg
 *   - home_2.jpg
 *   - home_3.jpg
 *   - home_4.jpg
 *   - home_5.jpg
 * - street/
 *   - street_1.jpg
 *   - street_2.jpg
 *   - street_3.jpg
 *   - street_4.jpg
 * - upper_floor/
 *   - upper_floor_1.jpg
 *   - upper_floor_2.jpg
 *   - upper_floor_3.jpg
 *   - upper_floor_4.jpg
 */

/**
 * Get image path for a scene based on image_key
 * Supports both JPG and PNG formats
 * @param imageKey - The image key from the scene data (e.g., "home_1", "street_2")
 * @param sceneType - The scene type (e.g., "home", "street", "upper_floor")
 * @returns Image path (tries PNG first, then JPG)
 */
export const getSceneImagePath = (imageKey: string, sceneType: string): string => {
    // Extract scene category and number from image_key
    // Format: "home_1", "street_2", "upper_floor_3"
    
    const category = sceneType.toLowerCase();
    // Try PNG first (since user has PNG files), then JPG as fallback
    return `/images/simulation/${category}/${imageKey}.png`;
};

/**
 * Get fallback image path based on scene type
 * @param sceneType - The scene type
 * @returns Fallback image path
 */
export const getFallbackImagePath = (sceneType: string): string => {
    const category = sceneType.toLowerCase();
    return `/images/simulation/${category}/default.jpg`;
};

/**
 * Get scene image path with fallback support
 * Tries PNG first, then JPG, then default
 * Handles naming variations (e.g., upper_floor vs upperfloor)
 * @param imageKey - The image key from the scene data
 * @param sceneType - The scene type
 * @returns Image path
 */
// Cache to track logged image requests (prevents duplicate logs)
const loggedImageRequests = new Set<string>();

export const getSceneImage = (imageKey: string, sceneType: string, logRequest: boolean = false): string => {
    const category = sceneType.toLowerCase();
    
    // Handle naming variations
    // Backend sends "upper_floor_1" but files are named "upperfloor_1"
    let normalizedKey = imageKey;
    if (category === 'upper_floor' && imageKey.includes('upper_floor')) {
        // Convert "upper_floor_1" to "upperfloor_1" to match actual file names
        normalizedKey = imageKey.replace('upper_floor', 'upperfloor');
    }
    
    // Try PNG first (most common format)
    const pngPath = `/images/simulation/${category}/${normalizedKey}.png`;
    
    // Only log once per unique image request
    const logKey = `${category}/${normalizedKey}`;
    if (logRequest && !loggedImageRequests.has(logKey)) {
        if (normalizedKey !== imageKey) {
            console.log(`🔄 Scene Image: Converted "${imageKey}" to "${normalizedKey}" for upper_floor category`);
        }
        console.log(`🖼️ Scene Image: Requesting image`, {
            category,
            originalKey: imageKey,
            normalizedKey,
            path: pngPath,
            sceneType
        });
        loggedImageRequests.add(logKey);
    }
    
    // Return PNG path (browser will handle fallback via onError)
    // The component will handle fallback to gradient if image fails
    return pngPath;
};

