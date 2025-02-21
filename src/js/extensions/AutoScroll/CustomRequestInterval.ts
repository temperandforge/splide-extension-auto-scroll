// todo: import { min, raf } from '../../utils';

export function raf( func: FrameRequestCallback ): number {
   return requestAnimationFrame( func );
}
 
/**
 * The interface for the returning value of the RequestInterval.
 *
 * @since 3.0.0
 */
export interface RequestIntervalInterface {
  start( resume?: boolean ): void;
  pause(): void;
  rewind(): void;
  cancel(): void;
  set( interval: number ): void;
  isPaused(): boolean;
}

/**
 * Requests interval like the native `setInterval()` with using `requestAnimationFrame`.
 *
 * @since 3.0.0
 *
 * @param interval   - The interval duration in milliseconds.
 * @param onInterval - The callback fired on every interval.
 * @param onUpdate   - Optional. Called on every animation frame, taking the progress rate.
 * @param limit      - Optional. Limits the number of interval.
 */
export function CustomRequestInterval(
  interval: number,
  onInterval: () => void,
  onUpdate?: ( rate: number ) => void,
  limit?: number
): RequestIntervalInterface {
  const { now } = Date;

  /**
   * The time when the interval starts.
   */
  let startTime: number;

  /**
   * The current progress rate.
   */
  let rate = 0;

  /**
   * The animation frame ID.
   */
  let id: number;

  /**
   * Indicates whether the interval is currently paused or not.
   */
  let paused = true;

  /**
   * The loop count. This only works when the `limit` argument is provided.
   */
   let count = 0;

   // todo:
   let targetFPS = 60
   
   let targetFrameTime = 1000 / targetFPS // Target time between frames in ms
   
   let accumulatedTime = 0
   
   let lastTime = 0
   
   let running = false
   
   /**
    * The buffer start function.
    */
   function bufferStart(updateFn: { (): void; (arg0: number): void; }) { //todo: type
      if (running) return
      running = true
      lastTime = performance.now()

      const animate = (currentTime: number) => {
         if (!running) return

         // Calculate elapsed time since last frame
         const deltaTime = currentTime - lastTime
         lastTime = currentTime

         // Add to accumulated time
         accumulatedTime += deltaTime

         // Update as many times as needed to catch up
         while (accumulatedTime >= targetFrameTime) {
            updateFn(targetFrameTime)
            accumulatedTime -= targetFrameTime
         }

         id = raf(animate)
      }

      id = raf(animate)
   }

  /**
   * The update function called on every animation frame.
   */
  function update(): void {
    if ( ! paused ) {
      rate = interval ? Math.min( ( now() - startTime ) / interval, 1 ) : 1;
      onUpdate && onUpdate( rate );

      if ( rate >= 1 ) {
        onInterval();
        startTime = now();

        if ( limit && ++count >= limit ) {
          return pause();
        }
      }

      // todo: id = raf( update );
    }
  }

  /**
   * Starts the interval.
   *
   * @param resume - Optional. Whether to resume the paused progress or not.
   */
  function start( resume?: boolean ): void {
    resume || cancel();
    startTime = now() - ( resume ? rate * interval : 0 );
    paused    = false;
   // todo:  id        = raf( update );
     
   bufferStart(update)
  }

  /**
   * Pauses the interval.
   */
  function pause(): void {
    paused = true;
  }

  /**
   * Rewinds the current progress.
   */
  function rewind(): void {
    startTime = now();
    rate      = 0;

    if ( onUpdate ) {
      onUpdate( rate );
    }
  }

  /**
   * Cancels the interval.
   */
  function cancel() {
    id && cancelAnimationFrame( id );
    rate   = 0;
    id     = 0;
    paused = true;
  }

  /**
   * Sets new interval duration.
   *
   * @param time - The interval duration in milliseconds.
   */
  function set( time: number ): void {
    interval = time;
  }

  /**
   * Checks if the interval is paused or not.
   *
   * @return `true` if the interval is paused, or otherwise `false`.
   */
  function isPaused(): boolean {
    return paused;
  }

  return {
    start,
    rewind,
    pause,
    cancel,
    set,
    isPaused,
  };
}
