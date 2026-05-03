import React from "react";
import PageHeader from "../components/common/PageHeader";
import ServicesGrid from "../components/sections/ServicesGrid";
import CtaStrip from "../components/sections/CtaStrip";
import useReveal from "../hooks/useReveal";

export default function Services() {
  const ref = useReveal([]);
  return (
    <main ref={ref} data-testid="services-page">
      <PageHeader
        eyebrow="Services"
        title="End-to-end capabilities for cross-border commodity trade."
        subtitle="Six integrated services — delivered through a single accountable trade desk, from first inquiry to final delivery and documentation."
      />
      <ServicesGrid />
      <CtaStrip />
    </main>
  );
}
