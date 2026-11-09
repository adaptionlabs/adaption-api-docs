// Section label shown above the title on each social card. Keys are the first
// path segment of a docs page; labels match the sidebar groups in
// astro.config.ts.
const SECTIONS: Record<string, string> = {
  introduction: "Introduction",
  "inference-stacks": "Inference Stacks",
  "adaptive-data": "Adaptive Data",
  autoscientist: "AutoScientist",
  runbooks: "Runbooks",
  tools: "Tools",
  resources: "Resources",
  guides: "Guides",
  api: "API Reference",
};

// Top-level pages that the sidebar files under a group.
const PAGES: Record<string, string> = {
  "adaptive-data-quickstart": "Introduction",
  "autoscientist-quickstart": "Introduction",
  oauth: "Tools",
};

export function sectionFor(id: string): string {
  const [first, ...rest] = id.split("/");
  const label = rest.length > 0 ? SECTIONS[first] : PAGES[id];
  return label ?? "Docs";
}
