// What the voice says in each scene. `at` is the frame (from the scene's start) the line aims to
// begin on, so words land with the action on screen; a line starts later if the one before runs on.
// `say` respells words the voice misreads, while `text` stays correct for the captions.
export const NARRATION: Record<string, { at: number; text: string; say?: string }[]> = {
  problem: [
    { at: 10, text: "Setting up a workspace shouldn't take a week." },
  ],
  title: [{ at: 12, text: "Introducing Acme." }],
  demo: [
    { at: 14, text: "Name your workspace, and save. That's it." },
  ],
  outro: [{ at: 10, text: "Acme. The one-line promise, said plainly." }],
};
