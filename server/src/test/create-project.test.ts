import request from 'supertest';
import express from 'express';
import { randomUUID } from "crypto";
import supabase from '../utils/supabase';

jest.mock('@supabase/supabase-js');
jest.mock('crypto');

// Mock environment variables
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_KEY = 'mock-key';

// Import the createProjectHandler after setting up mocks
import createProjectHandler from '../lib/handler/createProject';

const app = express();
app.use(express.json());
app.post('/create-project', createProjectHandler);
app.set('etag', false);

jest.mock('../utils/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn(),
  },
}));

describe('POST /create-project', () => {
  let mockSupabaseFrom: jest.Mock;
  let mockSupabaseInsert: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up Supabase client mock
    mockSupabaseInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabaseFrom = jest.fn().mockReturnValue({
      insert: mockSupabaseInsert,
    });
    supabase.from = mockSupabaseFrom;
  });

  it('should create a project successfully', async () => {
    const mockUuid = 'mocked-uuid';
    (randomUUID as jest.Mock).mockReturnValue(mockUuid);

    const validInput = {
      name: 'Test Project',
      data: [
        {
          backlink: 'https://example.com',
          primary_keyword: 'https://example.com/keyword1',
          seconday_keyword: 'https://example.com/keyword2',
          dr_0_30: '10',
          dr_30_60: '20',
          dr_60_100: '30',
          industry: 'Technology'
        }
      ]
    };

    const response = await request(app)
      .post('/create-project')
      .send(validInput);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ uuid: mockUuid });
    expect(mockSupabaseFrom).toHaveBeenCalledWith("project");
    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      createdat: expect.any(String),
      name: 'Test Project',
      id: mockUuid,
      status: 'initialization',
    });
  });

  it('should return 400 for invalid input - missing name', async () => {
    const invalidInput = {
      data: [
        {
          backlink: 'https://example.com',
          primary_keyword: 'https://example.com/keyword1',
          seconday_keyword: 'https://example.com/keyword2',
          dr_0_30: '10',
          dr_30_60: '20',
          dr_60_100: '30',
          industry: 'Technology'
        }
      ]
    };

    const response = await request(app)
      .post('/create-project')
      .send(invalidInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid input');
  });

  it('should return 400 for invalid input - empty data array', async () => {
    const invalidInput = {
      name: 'Test Project',
      data: []
    };

    const response = await request(app)
      .post('/create-project')
      .send(invalidInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid input');
  });

  it('should return 400 for invalid input - invalid URL in data', async () => {
    const invalidInput = {
      name: 'Test Project',
      data: [
        {
          backlink: 'not-a-url',
          primary_keyword: 'https://example.com/keyword1',
          seconday_keyword: 'https://example.com/keyword2',
          dr_0_30: '10',
          dr_30_60: '20',
          dr_60_100: '30',
          industry: 'Technology'
        }
      ]
    };

    const response = await request(app)
      .post('/create-project')
      .send(invalidInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid input');
  });

  it('should return 500 if Supabase insert fails', async () => {
    mockSupabaseInsert.mockResolvedValue({ error: new Error('Supabase error') });

    const validInput = {
      name: 'Test Project',
      data: [
        {
          backlink: 'https://example.com',
          primary_keyword: 'https://example.com/keyword1',
          seconday_keyword: 'https://example.com/keyword2',
          dr_0_30: '10',
          dr_30_60: '20',
          dr_60_100: '30',
          industry: 'Technology'
        }
      ]
    };

    const response = await request(app)
      .post('/create-project')
      .send(validInput);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Failed to create project');
  });

  it('should return 500 for unexpected errors', async () => {
    mockSupabaseInsert.mockResolvedValue({ error: new Error('Supabase error') });

    const validInput = {
      name: 'Test Project',
      data: [
        {
          backlink: 'https://example.com',
          primary_keyword: 'https://example.com/keyword1',
          seconday_keyword: 'https://example.com/keyword2',
          dr_0_30: '10',
          dr_30_60: '20',
          dr_60_100: '30',
          industry: 'Technology'
        }
      ]
    };

    const response = await request(app)
      .post('/create-project')
      .send(validInput);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Failed to create project');
  });

  it('should handle Supabase client initialization failure', async () => {
    // Mock the Supabase 'from' method to throw an error
    supabase.from = jest.fn().mockImplementation(() => {
      throw new Error('Failed to initialize Supabase client');
    });
  
    const validInput = {
      name: 'Test Project',
      data: [
        {
          backlink: 'https://example.com',
          primary_keyword: 'https://example.com/keyword1',
          seconday_keyword: 'https://example.com/keyword2',
          dr_0_30: '10',
          dr_30_60: '20',
          dr_60_100: '30',
          industry: 'Technology'
        }
      ]
    };
  
    const response = await request(app)
      .post('/create-project')
      .send(validInput);
  
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
  
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('An unexpected error occurred');
  });
});