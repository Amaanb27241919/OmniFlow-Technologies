import { Client } from "@notionhq/client";
import { 
  BlockObjectResponse,
  PartialBlockObjectResponse,
  PartialDatabaseObjectResponse,
  PageObjectResponse
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Initialize Notion client
 * Note: This client will be initialized when actual credentials are provided
 */
export let notion: Client | null = null;

// Initialize Notion page ID (will be extracted from URL)
export let NOTION_PAGE_ID: string | null = null;

/**
 * Initialize the Notion client with provided credentials
 * @returns {boolean} True if initialization was successful
 */
export function initializeNotion(): boolean {
  try {
    // Check if environment variables are set
    if (!process.env.NOTION_INTEGRATION_SECRET || !process.env.NOTION_PAGE_URL) {
      console.log("Notion credentials not provided. Skipping Notion integration.");
      return false;
    }

    // Create Notion client
    notion = new Client({
      auth: process.env.NOTION_INTEGRATION_SECRET,
    });

    // Extract page ID from URL
    NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL);
    
    console.log("Notion client initialized successfully with page ID:", NOTION_PAGE_ID);
    return true;
  } catch (error) {
    console.error("Failed to initialize Notion client:", error);
    return false;
  }
}

/**
 * Extract the page ID from the Notion page URL
 * @param {string} pageUrl The Notion page URL
 * @returns {string} The extracted page ID
 */
export function extractPageIdFromUrl(pageUrl: string): string {
  const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
  if (match && match[1]) {
    return match[1];
  }

  throw Error(`Failed to extract page ID from URL: ${pageUrl}`);
}

/**
 * Create an "Audit Intakes" database in Notion if it doesn't exist
 * @returns {Promise<string|null>} The database ID if successful, null otherwise
 */
export async function setupAuditIntakeDatabase(): Promise<string | null> {
  if (!notion || !NOTION_PAGE_ID) {
    console.log("Notion client not initialized. Skipping database setup.");
    return null;
  }

  try {
    // Check if database already exists by listing child blocks
    const existingDb = await findDatabaseByTitle("Business Audit Intakes");
    if (existingDb) {
      console.log("Business Audit Intakes database already exists with ID:", existingDb.id);
      return existingDb.id;
    }

    // Create new database
    const newDatabase = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: NOTION_PAGE_ID,
      },
      title: [
        {
          type: "text",
          text: {
            content: "Business Audit Intakes",
          },
        },
      ],
      properties: {
        // Title property (required)
        "Business Name": {
          title: {},
        },
        // Basic business info
        "Industry": {
          select: {
            options: [
              { name: "Retail", color: "blue" },
              { name: "Technology", color: "green" },
              { name: "Manufacturing", color: "orange" },
              { name: "Professional Services", color: "purple" },
              { name: "Healthcare", color: "red" },
              { name: "Education", color: "yellow" },
              { name: "Food & Beverage", color: "pink" },
              { name: "Other", color: "gray" }
            ]
          }
        },
        "Business Age": {
          select: {
            options: [
              { name: "< 1 year", color: "blue" },
              { name: "1-3 years", color: "green" },
              { name: "3-5 years", color: "yellow" },
              { name: "5-10 years", color: "orange" },
              { name: "10+ years", color: "red" }
            ]
          }
        },
        "Employees": {
          select: {
            options: [
              { name: "1-5", color: "blue" },
              { name: "6-15", color: "green" },
              { name: "16-50", color: "yellow" },
              { name: "51-200", color: "orange" },
              { name: "200+", color: "red" }
            ]
          }
        },
        "Monthly Revenue": {
          select: {
            options: [
              { name: "< $10,000", color: "gray" },
              { name: "$10,000 - $50,000", color: "blue" },
              { name: "$50,000 - $100,000", color: "green" },
              { name: "$100,000 - $500,000", color: "yellow" },
              { name: "$500,000+", color: "red" }
            ]
          }
        },
        // Additional business metrics
        "Uses Automation": {
          checkbox: {}
        },
        "Tracks CAC": {
          checkbox: {}
        },
        "Revenue Increasing": {
          checkbox: {}
        },
        // Audit results
        "Strengths": {
          multi_select: {
            options: [
              { name: "Strong Revenue", color: "green" },
              { name: "Good Profit Margin", color: "green" },
              { name: "Growth Trend", color: "green" },
              { name: "Effective Marketing", color: "green" },
              { name: "Uses Automation", color: "green" },
              { name: "Tracks Metrics", color: "green" }
            ]
          }
        },
        "Opportunities": {
          multi_select: {
            options: [
              { name: "Improve Efficiency", color: "yellow" },
              { name: "Reduce Expenses", color: "yellow" },
              { name: "Marketing Optimization", color: "yellow" },
              { name: "Process Automation", color: "yellow" },
              { name: "Better Tracking", color: "yellow" },
              { name: "Scale Operations", color: "yellow" }
            ]
          }
        },
        "AI Summary": {
          rich_text: {}
        },
        // Metadata
        "Created Date": {
          date: {}
        },
        "Audit ID": {
          number: {}
        }
      }
    });

    console.log("Business Audit Intakes database created with ID:", newDatabase.id);
    return newDatabase.id;
  } catch (error) {
    console.error("Error setting up Notion database:", error);
    return null;
  }
}

/**
 * Find a Notion database by its title
 * @param {string} title The title of the database to find
 * @returns {Promise<{id: string}|null>} The database object if found, null otherwise
 */
export async function findDatabaseByTitle(title: string): Promise<{ id: string } | null> {
  if (!notion || !NOTION_PAGE_ID) return null;

  try {
    // Query all child blocks in the specified page
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: NOTION_PAGE_ID,
        start_cursor: startCursor,
      });

      // Process the results
      for (const block of response.results) {
        // Check if the block is a child database
        if ('type' in block && block.type === "child_database") {
          const databaseId = block.id;

          // Retrieve the database title
          try {
            const databaseInfo = await notion.databases.retrieve({
              database_id: databaseId,
            });

            // Check if the title matches
            // Using type assertion to handle the API response structure
            const titleProperty = (databaseInfo as any).title as Array<{
              plain_text?: string;
            }> | undefined;
            
            const dbTitle = titleProperty?.[0]?.plain_text?.toLowerCase();
            if (dbTitle === title.toLowerCase()) {
              return { id: databaseId };
            }
          } catch (error) {
            console.error(`Error retrieving database ${databaseId}:`, error);
          }
        }
      }

      // Check if there are more results to fetch
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return null;
  } catch (error) {
    console.error("Error finding database by title:", error);
    return null;
  }
}

/**
 * Add an audit record to the Notion database
 * @param {any} auditData The audit data to add
 * @param {string} databaseId The ID of the database to add the record to
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function addAuditToNotion(auditData: any, databaseId: string): Promise<boolean> {
  if (!notion) return false;

  try {
    // Create Notion page (database entry)
    await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        // Title field (required)
        "Business Name": {
          title: [
            {
              text: {
                content: auditData.businessName || "Unnamed Business",
              },
            },
          ],
        },
        // Business details
        "Industry": {
          select: {
            name: auditData.industry || "Other",
          },
        },
        "Business Age": {
          select: {
            name: auditData.businessAge || "< 1 year",
          },
        },
        "Employees": {
          select: {
            name: auditData.employees || "1-5",
          },
        },
        "Monthly Revenue": {
          select: {
            name: auditData.monthlyRevenue || "< $10,000",
          },
        },
        // Business metrics as checkboxes
        "Uses Automation": {
          checkbox: auditData.usesAutomation === "yes",
        },
        "Tracks CAC": {
          checkbox: auditData.tracksCAC === "yes",
        },
        "Revenue Increasing": {
          checkbox: auditData.revenueIncreased === "yes",
        },
        // Audit results
        "Strengths": {
          multi_select: (auditData.strengths || []).map((strength: string) => ({
            name: strength.length > 100 ? strength.substring(0, 97) + "..." : strength,
          })),
        },
        "Opportunities": {
          multi_select: (auditData.opportunities || []).map((opportunity: string) => ({
            name: opportunity.length > 100 ? opportunity.substring(0, 97) + "..." : opportunity,
          })),
        },
        "AI Summary": {
          rich_text: [
            {
              text: {
                content: auditData.aiRecommendation || "",
              },
            },
          ],
        },
        // Metadata
        "Created Date": {
          date: {
            start: new Date().toISOString(),
          },
        },
        "Audit ID": {
          number: auditData.id || 0,
        },
      },
    });

    console.log(`Added audit for ${auditData.businessName} to Notion database`);
    return true;
  } catch (error) {
    console.error("Error adding audit to Notion:", error);
    return false;
  }
}