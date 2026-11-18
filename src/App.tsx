import { useMemo } from "react";
import { MOMENTS, parseCatalog, type CardsFile } from "./catalog";
import { MomentSection } from "./MomentSection";

export interface AppProps {
  cardsFile: CardsFile;
}

export function App({ cardsFile }: AppProps) {
  const catalog = useMemo(() => parseCatalog(cardsFile), [cardsFile]);

  return (
    <main className="mx-auto max-w-screen-sm py-2">
      {MOMENTS.map((moment) => (
        <MomentSection
          key={moment}
          moment={moment}
          goal={catalog.goal.moments[moment]}
          cards={catalog.cards[moment]}
        />
      ))}
    </main>
  );
}
