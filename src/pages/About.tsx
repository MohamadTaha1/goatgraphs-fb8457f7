import { useEffect } from 'react';

export default function About() {
  useEffect(() => { document.title = 'About – GoatGraphs'; }, []);
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-black tracking-tight mb-8">ABOUT GOATGRAPHS</h1>
      <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
        <p>GoatGraphs is your premier destination for authentic football jerseys from the world's greatest clubs and national teams. We specialize in match-worn, player-issue, and authentic replica jerseys that tell the story of the beautiful game.</p>
        <p>Founded by passionate football collectors, we understand the value of authenticity. Every jersey in our collection is verified and comes with a certificate of authenticity.</p>
        <p>Whether you're looking for the latest season's kit or a rare vintage piece, GoatGraphs has you covered with an extensive selection from leagues across the globe.</p>
      </div>
    </div>
  );
}
