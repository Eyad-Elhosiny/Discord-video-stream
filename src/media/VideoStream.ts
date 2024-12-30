import { Writable } from "stream";
import { MediaUdp } from "../client/voice/MediaUdp.js";

export class VideoStream extends Writable {
    public udp: MediaUdp;
    public count: number;
    public sleepTime: number;
    public startTime?: number;
    private noSleep: boolean;
    private paused: boolean = false;
    private lastFrame: any; // New: Buffer to store the last frame


    constructor(udp: MediaUdp, fps: number = 30, noSleep = false) {
        super();
        this.udp = udp;
        this.count = 0;
        this.sleepTime = 1000 / fps;
        this.noSleep = noSleep;
        this.lastFrame = null;

    }

    public setSleepTime(time: number) {
        this.sleepTime = time;
    }

    async _write(frame: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
        if (this.paused && this.lastFrame) {
            // setTimeout(() => callback(), this.sleepTime); // Prevent blocking
            this.udp.sendVideoFrame(this.lastFrame);
            return;
        }
        
        this.count++;
        const next = (this.count + 1) * this.sleepTime - (performance.now() - this.startTime);
        this.lastFrame = frame;
        
        if (!this.startTime)
            this.startTime = performance.now();

        this.udp.sendVideoFrame(frame);

        
        if (this.noSleep) {
            callback();
        } else {
            setTimeout(() => {
                callback();
            }, next);
        }
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
}
