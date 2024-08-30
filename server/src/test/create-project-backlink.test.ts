import request from 'supertest';
import express from 'express';
import createProjectBacklinksHandler from '../lib/handler/createProjectBacklink';
import supabase from '../utils/supabase';
import { blogQueue } from '../utils/queue';

// Mocking dependencies
jest.mock('../utils/supabase', () => ({
    from: jest.fn().mockReturnValue({
        insert: jest.fn()
    })
}));

jest.mock('../utils/queue', () => ({
    blogQueue: { add: jest.fn() }
}));

const app = express();
app.use(express.json());
app.post('/create-project-backlinks', createProjectBacklinksHandler);

describe('createProjectBacklinksHandler', () => {
    it('should return 200 and success message for valid input', async () => {
        const validData = [
            {
                project_uuid: "test-uuid",
                backlink: "https://example.com",
                primary_keyword: "example",
                seconday_keyword: "test",
                dr_0_30: "5",
                dr_30_60: "10",
                dr_60_100: "15",
                industry: "tech"
            }
        ];

        const mockInsert = jest.fn().mockResolvedValue({
            data: [], // Mocked data
            error: null,
            count: null,
            status: 200,
            statusText: "OK"
        });
        (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
        jest.spyOn(blogQueue, 'add').mockResolvedValue({} as any); // Adjust as necessary

        const response = await request(app)
            .post('/create-project-backlinks')
            .send(validData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Project points created successfully");
    });

    it('should return 400 for validation errors', async () => {
        const invalidData = [
            {
                project_uuid: "test-uuid",
                backlink: "invalid-url",
                primary_keyword: "example",
                seconday_keyword: "test",
                dr_0_30: "invalid",
                dr_30_60: "10",
                dr_60_100: "15",
                industry: "tech"
            }
        ];

        jest.spyOn(supabase.from("backlink"), 'insert').mockResolvedValue({
            data: null,
            error: null,
            count: null,
            status: 200,
            statusText: "OK"
        });
        jest.spyOn(blogQueue, 'add').mockResolvedValue({} as any);

        const response = await request(app)
            .post('/create-project-backlinks')
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Validation error: Invalid url");
    });

    it('should return 500 if Supabase insertion fails', async () => {
        const validData = [
            {
                project_uuid: "test-uuid",
                backlink: "http://example.com",
                primary_keyword: "example",
                seconday_keyword: "test",
                dr_0_30: "5",
                dr_30_60: "10",
                dr_60_100: "15",
                industry: "tech"
            }
        ];

        const mockInsert = jest.fn().mockResolvedValue({
            data: [],
            error: new Error('Supabase error'),
            count: null,
            status: 500,
            statusText: "Internal Server Error"
        });
        (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
        jest.spyOn(blogQueue, 'add').mockResolvedValue({} as any);

        const response = await request(app)
            .post('/create-project-backlinks')
            .send(validData);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to insert data into Supabase: Supabase error");
    });

    it('should return 500 for unexpected errors', async () => {
        const validData = [
            {
                project_uuid: "test-uuid",
                backlink: "http://example.com",
                primary_keyword: "example",
                seconday_keyword: "test",
                dr_0_30: "5",
                dr_30_60: "10",
                dr_60_100: "15",
                industry: "tech"
            }
        ];

        jest.spyOn(supabase.from("backlink"), 'insert').mockImplementation(() => {
            throw new Error('Unexpected error');
        });
        jest.spyOn(blogQueue, 'add').mockResolvedValue({} as any);

        const response = await request(app)
            .post('/create-project-backlinks')
            .send(validData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("An unexpected error occurred");
    });
});