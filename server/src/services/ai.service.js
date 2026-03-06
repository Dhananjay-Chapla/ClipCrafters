import axios from 'axios';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';
import AIGeneration from '../models/AIGeneration.js';
import { logger } from '../utils/logger.js';

// shared axios client for FastAPI
const fastApiClient = axios.create({
    baseURL: env.fastApiUrl,
    timeout: 120_000, // 2 min — generation can be slow
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Internal helper — calls FastAPI, logs the call in AIGeneration collection
 */
const callAgent = async ({ projectId, videoId, agentType, endpoint, payload }) => {
    const start = Date.now();
    let status = 'success';
    let outputData = null;

    try {
        const { data } = await fastApiClient.post(endpoint, payload);
        outputData = data;
        return data;
    } catch (error) {
        status = 'failed';
        logger.error(`AI agent "${agentType}" failed: ${error.message}`);
        throw new ApiError(
            error.response?.status || 502,
            `AI service error (${agentType}): ${error.response?.data?.detail || error.message}`
        );
    } finally {
        // Always persist the AI call record regardless of outcome
        await AIGeneration.create({
            projectId,
            videoId: videoId || null,
            agentType,
            inputData: payload,
            outputData,
            modelUsed: outputData?.model_used || null,
            tokensUsed: outputData?.tokens_used || 0,
            latencyMs: Date.now() - start,
            status,
        }).catch((e) => logger.warn('Failed to log AIGeneration record:', e.message));
    }
};

// ─── Public Agent Wrappers ─────────────────────────────────────────────────

/**
 * generateScript — calls script-agent on FastAPI
 * @param {string} text - raw input text / research content
 * @param {string} projectId
 */
export const generateScript = (text, projectId) =>
    callAgent({
        projectId,
        agentType: 'script-agent',
        endpoint: '/generate-script',
        payload: { text },
    });

/**
 * generateScenes — calls script-agent to split script into scenes
 * @param {string} script
 * @param {string} projectId
 * @param {string} videoId
 */
export const generateScenes = (script, projectId, videoId) =>
    callAgent({
        projectId,
        videoId,
        agentType: 'script-agent',
        endpoint: '/generate-scenes',
        payload: { script },
    });

/**
 * generateVoice — calls voice-agent to produce voiceover audio
 * @param {string} sceneText
 * @param {string} projectId
 * @param {string} videoId
 */
export const generateVoice = (sceneText, projectId, videoId) =>
    callAgent({
        projectId,
        videoId,
        agentType: 'voice-agent',
        endpoint: '/generate-voice',
        payload: { text: sceneText },
    });

/**
 * generateVisual — calls visual-agent to produce scene image/video
 */
export const generateVisual = (visualPrompt, projectId, videoId) =>
    callAgent({
        projectId,
        videoId,
        agentType: 'visual-agent',
        endpoint: '/generate-visual',
        payload: { prompt: visualPrompt },
    });

/**
 * factCheckContent — calls factcheck-agent
 */
export const factCheckContent = (content, projectId) =>
    callAgent({
        projectId,
        agentType: 'factcheck-agent',
        endpoint: '/factcheck',
        payload: { content },
    });
