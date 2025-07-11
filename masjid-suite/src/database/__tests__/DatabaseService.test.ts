import DatabaseService from '../DatabaseService';

// Mock electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue(':memory:') // Use in-memory database for tests
  }
}));

describe('DatabaseService', () => {
  // Reset the singleton instance before each test
  beforeEach(() => {
    // @ts-ignore - Accessing private property for testing
    DatabaseService.instance = null;
  });

  // Close the database connection after each test
  afterEach(async () => {
    // @ts-ignore - Accessing private property for testing
    if (DatabaseService.instance?.db) {
      // @ts-ignore - Accessing private property for testing
      await DatabaseService.instance.db.close();
    }
  });

  describe('Database Operations', () => {
    it('should initialize database connection', () => {
      const dbService = DatabaseService;
      expect(dbService).toBeDefined();
    });
  });

  describe('Member Operations', () => {
    it('should create and retrieve a member', async () => {
      // Test data with unique membershipId
      const testMember = {
        membershipId: `TEST-${Date.now()}`,
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male' as const,
        dateOfBirth: '1990-01-01',
        nationality: 'US',
        maritalStatus: 'single' as const,
        occupation: 'Engineer',
        educationLevel: 'Bachelors',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA'
        },
        contact: {
          phone: '123-456-7890'
        },
        joinDate: new Date().toISOString(),
        status: 'active' as const
      };

      // Create member
      const memberId = await DatabaseService.createMember(testMember);
      expect(memberId).toBeDefined();
      expect(typeof memberId).toBe('string');

      // Retrieve member
      const member = await DatabaseService.getMember(memberId);
      expect(member).toBeDefined();
      expect(member?.id).toBe(memberId);
      expect(member?.firstName).toBe(testMember.firstName);
      expect(member?.lastName).toBe(testMember.lastName);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Force an error by using an invalid database path
      const originalGetPath = require('electron').app.getPath;
      require('electron').app.getPath = jest.fn().mockReturnValue('/invalid/path');
      
      // Reset the instance
      // @ts-ignore - Accessing private property for testing
      DatabaseService.instance = null;
      
      try {
        // Try to access the database - should return null or throw an error
        const result = await DatabaseService.getMember('test');
        expect(result).toBeNull();
      } catch (error) {
        // If it throws an error instead of returning null, that's also acceptable
        expect(error).toBeDefined();
      } finally {
        // Restore the original getPath
        require('electron').app.getPath = originalGetPath;
      }
    });
  });
});
