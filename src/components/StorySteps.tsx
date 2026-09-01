"use client";

import { useLanguage } from "./LanguageProvider";

export function StorySteps() {
  const { t } = useLanguage();

  const steps = [
    ["01", t.story.problem, t.story.problemTitle, t.story.problemText],
    ["02", t.story.where, t.story.whereTitle, t.story.whereText],
    ["03", t.story.when, t.story.whenTitle, t.story.whenText],
    ["04", t.story.action, t.story.actionTitle, t.story.actionText],
    ["05", t.story.learn, t.story.learnTitle, t.story.learnText]
  ];

  return (
    <div className="storySteps">
      {steps.map(([number, label, title, text]) => (
        <article className="storyStep" key={number}>
          <div className="storyNum">{number}</div>
          <div>
            <div className="eyebrow">{label}</div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
