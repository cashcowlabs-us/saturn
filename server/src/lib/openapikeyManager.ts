import type { SupabaseClient } from '@supabase/supabase-js';
import supabase from '../utils/supabase';
import { Database } from '../database.types';
import { randomUUID } from 'crypto';

interface OpenAIKey {
    id: string;
    key: string;
    requestsRemaining: number;
    tokensRemaining: number;
    requestsResetTime: Date;
    tokensResetTime: Date;
    state: boolean;
    message: string | null;
}

export function createKeyManager(supabase: SupabaseClient<Database>) {
    let currentKeyIndex = 0;

    async function addKey(key: string): Promise<void> {
        console.log(`Adding key: ${key}`);

        // Test the key before adding
        const testResult = await testKey(key);
        if (testResult instanceof Error) {
            throw new Error(`Key test failed: ${testResult.message}`);
        }

        const { error } = await supabase
            .from('api_keys')
            .insert({
                id: randomUUID(),
                key: key,
                requests_remaining: testResult.requestsRemaining,
                requests_reset_time: testResult.requestsResetTime.toISOString(),
                tokens_remaining: testResult.tokensRemaining,
                tokens_reset_time: testResult.tokensResetTime.toISOString(),
                message: testResult.message,
                state: testResult.state
            });

        if (error instanceof Error) throw error;
    }



    async function testKey(key: string): Promise<OpenAIKey | Error> {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: "Hello" }],
                    max_tokens: 1
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const headers = response.headers;
            return {
                id: '', // This will be assigned when actually adding the key
                key: key,
                requestsRemaining: parseInt(headers.get('x-ratelimit-remaining-requests') || '0'),
                tokensRemaining: parseInt(headers.get('x-ratelimit-remaining-tokens') || '0'),
                requestsResetTime: new Date(Date.now() + parseResetTime(headers.get('x-ratelimit-reset-requests') || '0s')),
                tokensResetTime: new Date(Date.now() + parseResetTime(headers.get('x-ratelimit-reset-tokens') || '0s')),
                state: true,
                message: null
            };
        } catch (error) {
            if (error instanceof Error) {
                return new Error(`Key test failed: ${error.message}`);
            }
            return new Error("Unexpected error occurred during key test.");
        }
    }
    async function refreshKeys(): Promise<void> {
        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('*');

        if (error) throw error;
        if (!keys || keys.length === 0) {
            console.log("No API keys to refresh");
            return;
        }

        for (const key of keys) {
            const testResult = await testKey(key.key);
            if (testResult instanceof Error) {
                await updateKeyState(key.id, false, testResult.message);
            } else {
                await supabase
                    .from('api_keys')
                    .update({
                        requests_remaining: testResult.requestsRemaining,
                        tokens_remaining: testResult.tokensRemaining,
                        requests_reset_time: testResult.requestsResetTime.toISOString(),
                        tokens_reset_time: testResult.tokensResetTime.toISOString(),
                        state: true,
                        message: 'Key refreshed successfully'
                    })
                    .eq('id', key.id);
            }
        }
    }


    async function removeKey(key: string): Promise<void> {
        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('key', key);

        if (error) throw error;

        // Reset currentKeyIndex if necessary
        const { count } = await supabase
            .from('api_keys')
            .select('*', { count: 'exact' });

        if (currentKeyIndex >= (count || 0)) {
            currentKeyIndex = 0;
        }
    }

    async function updateKeyLimits(id: string, headers: Headers): Promise<void> {
        const { error } = await supabase
            .from('api_keys')
            .update({
                requests_remaining: parseInt(headers.get('x-ratelimit-remaining-requests') || '0'),
                tokens_remaining: parseInt(headers.get('x-ratelimit-remaining-tokens') || '0'),
                requests_reset_time: new Date(Date.now() + parseResetTime(headers.get('x-ratelimit-reset-requests') || '0s')).toISOString(),
                tokens_reset_time: new Date(Date.now() + parseResetTime(headers.get('x-ratelimit-reset-tokens') || '0s')).toISOString(),
            })
            .eq('id', id);

        if (error) throw error;
    }

    function parseResetTime(resetTime: string): number {
        const match = resetTime.match(/(\d+)([smh])/);
        if (!match) return 0;
        const [, value, unit] = match;
        switch (unit) {
            case 's': return parseInt(value) * 1000;
            case 'm': return parseInt(value) * 60000;
            case 'h': return parseInt(value) * 3600000;
            default: return 0;
        }
    }

    async function executeRequest(requestFn: (key: string) => Promise<any>): Promise<any> {
        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('state', true)
            .order('id');

        if (error) throw error;
        if (!keys || keys.length === 0) {
            return new Error("No active API keys available");
        }

        const openAIKeys: OpenAIKey[] = keys.map((key) => ({
            id: key.id,
            key: key.key,
            requestsRemaining: key.requests_remaining,
            tokensRemaining: key.tokens_remaining,
            requestsResetTime: new Date(key.requests_reset_time),
            tokensResetTime: new Date(key.tokens_reset_time),
            state: key.state,
            message: key.message
        }));

        const startIndex = currentKeyIndex;
        do {
            const key = openAIKeys[currentKeyIndex];
            if (key.requestsRemaining > 0 && key.tokensRemaining > 0) {
                try {
                    const response = await requestFn(key.key);
                    const headers = response.headers as Headers;
                    await updateKeyLimits(key.id, headers);
                    return response.json();
                } catch (error) {
                    if (error instanceof Error) {
                        console.error(`Error with key of id ${key.id}:`, error.message);
                        await updateKeyState(key.id, false, error.message);
                    }
                }
            }

            currentKeyIndex = (currentKeyIndex + 1) % openAIKeys.length;
        } while (currentKeyIndex !== startIndex);

        const nextAvailableTime = await getNextAvailableTime();
        return new Error(`All API keys exhausted. Try again after ${nextAvailableTime.toISOString()}`);
    }

    async function updateKeyState(id: string, state: boolean, message: string): Promise<void> {
        const { error } = await supabase
            .from('api_keys')
            .update({ state, message })
            .eq('id', id);

        if (error) throw error;
    }

    async function getNextAvailableTime(): Promise<Date> {
        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('requests_reset_time, tokens_reset_time')
            .eq('state', true);

        if (error) throw error;
        if (!keys || keys.length === 0) {
            return new Date(Date.now() + 3600000); // Default to 1 hour from now if no keys are available
        }

        return keys.reduce((earliest, key) => {
            const keyEarliest = new Date(Math.min(new Date(key.requests_reset_time).getTime(), new Date(key.tokens_reset_time).getTime()));
            return keyEarliest < earliest ? keyEarliest : earliest;
        }, new Date(Date.now() + 3600000));
    }

    function calculateMaxBlogs(tokensRemaining: number, tokensPerBlog: number): number {
        return Math.floor(tokensRemaining / tokensPerBlog);
    }

    function calculateDaysToExhaustTokens(tokensRemaining: number, tokensPerDay: number): number {
        return Math.ceil(tokensRemaining / tokensPerDay);
    }

    return {
        addKey,
        removeKey,
        executeRequest,
        refreshKeys,
        calculateMaxBlogs,
        calculateDaysToExhaustTokens
    };
}

export function createContentGenerator(keyManager: ReturnType<typeof createKeyManager>) {
    async function generateContent(prompt: string): Promise<string | Error> {
        try {
            const response = await keyManager.executeRequest(async (key) => {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [{ role: "user", content: prompt }],
                        max_tokens: 500
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
            });
            if (response instanceof Error) {
                return response;
            }

            return response.choices[0].message.content.trim();
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during content generation:', error.message);
                return new Error(`Content generation failed: ${error.message}`);
            }
            console.error('Unexpected error during content generation:', error);
            return new Error("Unexpected error occurred during content generation.");
        }
    }

    async function getTokenUsage(): Promise<number> {
        try {
            const { data: keys, error } = await supabase
                .from('api_keys')
                .select('tokens_remaining')
                .eq('state', true);

            if (error) throw error;
            if (!keys || keys.length === 0) return 0;

            return keys.reduce((total, key) => total + key.tokens_remaining, 0);
        } catch (error) {
            console.error('Error retrieving token usage:', error);
            return 0;
        }
    }


    async function calculateTokenUsagePerDay(): Promise<number> {
        const totalTokens = await getTokenUsage();
        // Estimate based on average daily usage (example: 1000 tokens/day)
        return totalTokens / 500; // Assume a month has 30 days
    }

    return {
        generateContent,
        calculateTokenUsagePerDay
    };
}

export const keyManager = createKeyManager(supabase);
export const contentGenerator = createContentGenerator(keyManager);
