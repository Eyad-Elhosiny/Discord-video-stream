import { Writable } from "stream";
import { MediaUdp } from "../client/voice/MediaUdp";

class AudioStream extends Writable {
    public udp: MediaUdp;
    public count: number;
    public sleepTime: number;
    public startTime?: number;
    private noSleep: boolean;
    private paused: boolean; // New: Pause flag

    constructor(udp: MediaUdp, noSleep = false) {
        super();
        this.udp = udp;
        this.count = 0;
        this.sleepTime = 20;
        this.noSleep = noSleep;
        this.paused = false;
    }

    public pauseStream() {
        this.paused = true;
    }

    public resumeStream() {
        this.paused = false;
    }

    _write(chunk: any, _: BufferEncoding, callback: (error?: Error | null) => void) {
        if (this.paused) {
            // setTimeout(() => callback(), this.sleepTime); // Prevent blocking
            return;
        }

        this.count++;
        if (!this.startTime) this.startTime = performance.now();

        this.udp.sendAudioFrame(chunk);

        const next = (this.count + 1) * this.sleepTime - (performance.now() - this.startTime);

        if (this.noSleep) {
            callback();
        } else {
            setTimeout(() => {
                callback();
            }, next);
        }
    }
}

export { AudioStream };
