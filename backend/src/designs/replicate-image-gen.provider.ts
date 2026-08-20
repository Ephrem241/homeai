import { Injectable, Logger } from '@nestjs/common';

import type { GeneratedDesign, ImageGenProvider } from './image-gen.provider';

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string | null;
  urls: { get: string };
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 20; // ~40s on top of the initial synchronous wait

// Real implementation, active once REPLICATE_API_TOKEN is set (see
// designs.module.ts). Uses adirik/interior-design — an image+prompt
// inpainting pipeline purpose-built for exactly this "redesign this room"
// task — via Replicate's REST API directly (no SDK dependency, same
// approach as twilio-sms.provider.ts).
@Injectable()
export class ReplicateImageGenProvider implements ImageGenProvider {
  private readonly logger = new Logger(ReplicateImageGenProvider.name);
  private readonly token = process.env.REPLICATE_API_TOKEN as string;

  async generateDesign(originalImageUrl: string, roomType: string, style: string): Promise<GeneratedDesign> {
    const response = await fetch('https://api.replicate.com/v1/models/adirik/interior-design/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=25',
      },
      body: JSON.stringify({
        input: {
          image: originalImageUrl,
          prompt: `${style} style ${roomType}, high quality, photorealistic interior design`,
          negative_prompt: 'blurry, low quality, distorted, watermark',
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(`Replicate request failed (${response.status}): ${detail}`);
      throw new Error('Failed to generate design');
    }

    let prediction = (await response.json()) as ReplicatePrediction;
    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
      if (attempts >= MAX_POLL_ATTEMPTS) {
        throw new Error('Design generation timed out');
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      const poll = await fetch(prediction.urls.get, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      prediction = (await poll.json()) as ReplicatePrediction;
      attempts += 1;
    }

    if (prediction.status !== 'succeeded' || !prediction.output) {
      this.logger.error(`Replicate prediction ${prediction.status}: ${prediction.error ?? 'no output'}`);
      throw new Error('Failed to generate design');
    }

    const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    return { imageUrl, isPlaceholder: false };
  }
}
