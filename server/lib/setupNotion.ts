import { initializeNotion, setupAuditIntakeDatabase } from './notion';

/**
 * Setup the Notion integration when the server starts
 * This will check for Notion credentials and create the necessary database
 * @returns {Promise<boolean>} True if setup was successful, false otherwise
 */
export async function setupNotionIntegration(): Promise<boolean> {
  try {
    // Initialize Notion client
    const isInitialized = initializeNotion();
    if (!isInitialized) {
      console.log("Notion integration is not enabled. Skipping setup.");
      return false;
    }
    
    // Create the audit intakes database if it doesn't exist
    const databaseId = await setupAuditIntakeDatabase();
    if (!databaseId) {
      console.warn("Failed to set up Notion database. Notion integration will be disabled.");
      return false;
    }
    
    console.log("Notion integration setup successfully!");
    return true;
  } catch (error) {
    console.error("Error setting up Notion integration:", error);
    return false;
  }
}