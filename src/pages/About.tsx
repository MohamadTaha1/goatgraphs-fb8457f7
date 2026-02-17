import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    document.title = "About - GoatGraphs";
  }, []);

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-4xl">
        <h1 className="display-title text-4xl sm:text-5xl">About GoatGraphs</h1>
        <div className="soft-panel mt-6 space-y-5 p-6 text-muted-foreground sm:p-8">
          <p>
            GoatGraphs is a football jersey store focused on authentic shirts from clubs and national teams. We built this platform to make discovery, checkout, and order tracking clear on every device.
          </p>
          <p>
            Our catalog combines current season drops and collectible pieces. Every listing is verified, well-labeled, and managed through a full admin control panel.
          </p>
          <p>
            From browsing to after-sale support, the goal is reliability: transparent shipping, straightforward returns, and clean account tools for repeat orders.
          </p>
        </div>
      </div>
    </div>
  );
}
