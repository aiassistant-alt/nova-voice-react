/**
 * ^SonicAudioProcessor
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-27
 * Usage: AudioWorklet processor for Nova Sonic continuous audio playback
 * Business Context: Eliminates audio stuttering by using continuous buffer like AWS official examples
 * Relations: Used by VoiceAssistant for smooth audio playback
 * Reminders: Based on AWS official ExpandableBuffer implementation
 */

// ✅ Implementación basada en ejemplos oficiales AWS Nova Sonic
class ExpandableAudioBuffer {
    constructor() {
        // Start with buffer for smooth playback (AWS pattern)
        this.buffer = new Float32Array(24000); // 1 second @ 24kHz (AWS default)
        this.readIndex = 0;
        this.writeIndex = 0;
        this.underflowedSamples = 0;
        this.isInitialBuffering = true;
        this.initialBufferLength = 12000; // 0.5 seconds for faster start
        this.lastWriteTime = 0;
    }

    write(samples) {
        this.lastWriteTime = Date.now();
        
        if (this.writeIndex + samples.length <= this.buffer.length) {
            // Enough space to append
        }
        else {
            // Need to shift or expand buffer (AWS pattern)
            if (samples.length <= this.readIndex) {
                // Shift to beginning
                const subarray = this.buffer.subarray(this.readIndex, this.writeIndex);
                this.buffer.set(subarray);
            }
            else {
                // Expand buffer capacity
                const newLength = (samples.length + this.writeIndex - this.readIndex) * 2;
                const newBuffer = new Float32Array(newLength);
                newBuffer.set(this.buffer.subarray(this.readIndex, this.writeIndex));
                this.buffer = newBuffer;
            }
            this.writeIndex -= this.readIndex;
            this.readIndex = 0;
        }
        
        this.buffer.set(samples, this.writeIndex);
        this.writeIndex += samples.length;
        
        // Check if initial buffer is filled (AWS pattern)
        if (this.writeIndex - this.readIndex >= this.initialBufferLength) {
            this.isInitialBuffering = false;
        }
    }

    read(destination) {
        let copyLength = 0;
        if (!this.isInitialBuffering) {
            // Only play after initial cushion is built
            copyLength = Math.min(destination.length, this.writeIndex - this.readIndex);
        }
        
        destination.set(this.buffer.subarray(this.readIndex, this.readIndex + copyLength));
        this.readIndex += copyLength;
        
        if (copyLength < destination.length) {
            // Buffer underflow - fill with silence (AWS pattern)
            destination.fill(0, copyLength);
            this.underflowedSamples += destination.length - copyLength;
        }
        
        if (copyLength === 0) {
            // No audio available - restart buffering
            this.isInitialBuffering = true;
        }
    }

    clearBuffer() {
        this.readIndex = 0;
        this.writeIndex = 0;
        this.isInitialBuffering = true;
    }

    getBufferStatus() {
        return {
            available: this.writeIndex - this.readIndex,
            buffering: this.isInitialBuffering,
            underflowed: this.underflowedSamples
        };
    }
}

class SonicAudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.playbackBuffer = new ExpandableAudioBuffer();
        
        this.port.onmessage = (event) => {
            switch (event.data.type) {
                case "audio":
                    if (event.data.audioData && event.data.audioData.length > 0) {
                        this.playbackBuffer.write(event.data.audioData);
                    }
                    break;
                case "clear":
                    this.playbackBuffer.clearBuffer();
                    break;
                case "status":
                    this.port.postMessage({
                        type: "status-response",
                        status: this.playbackBuffer.getBufferStatus()
                    });
                    break;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0][0]; // Single channel output
        if (output) {
            this.playbackBuffer.read(output);
        }
        return true; // Keep processor alive
    }
}

registerProcessor("sonic-audio-processor", SonicAudioProcessor);

