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
        
        const { error } = await supabase
            .from('api_keys')
            .insert({
                id: randomUUID(),
                key,
                requests_remaining: 60,
                tokens_remaining: 150000,
                requests_reset_time: new Date(Date.now() + 60000).toISOString(),
                tokens_reset_time: new Date(Date.now() + 360000).toISOString(),
                state: true,
                message: 'Key added successfully'
            });
        console.log(error);
        
        if (error instanceof Error) throw error;
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

    return {
        addKey,
        removeKey,
        executeRequest
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
                        max_tokens: 100
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

    return {
        generateContent
    };
}

export const keyManager = createKeyManager(supabase);
export const contentGenerator = createContentGenerator(keyManager);
