import styles from "./HomePromoVideo.module.css";

const SCENES = [
  ["Anticipate", "What changed outside the club: competing kick-offs, broadcast, weather, the international window."],
  ["Decide", "The radar reorders fixtures by that context and says why; the brief recommends one move."],
  ["Activate", "Approved work goes to the club’s own tool; AVELA reads the status back."],
  ["Learn", "Delivered and Worked stay separate: done tasks are not proof the move worked."]
] as const;

/** The 45-second product film, placed right after the hero so a visitor sees the loop before the detail. */
export function HomePromoVideo() {
  return (
    <section className={styles.film} aria-labelledby="film-title">
      <div className={styles.intro}>
        <h2 id="film-title">The loop, in 45 seconds.</h2>
        <p>From a signal outside the club to a task in your team’s tool, and what you learn after the match.</p>
      </div>
      <div className={styles.detail}>
        <ol className={styles.scenes}>
          {SCENES.map(([step, detail]) => (
            <li key={step}><strong>{step}</strong><span>{detail}</span></li>
          ))}
        </ol>
        <p className={styles.note}>Real AVELA screens on public London City Lionesses information; execution status uses sample tasks. London City is not an AVELA customer. Music only, no narration.</p>
      </div>
      <div className={styles.frame}>
        <video
          className={styles.video}
          src="/media/avela-promo.mp4"
          poster="/media/avela-promo-poster.jpg"
          controls
          muted
          playsInline
          preload="none"
          width={720}
          height={1280}
          aria-label="45-second AVELA product film: anticipate, decide, activate, learn. The steps are described next to the video."
        />
      </div>
    </section>
  );
}
