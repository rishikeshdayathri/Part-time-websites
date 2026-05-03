import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Phone, MapPin, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import useReveal from "../hooks/useReveal";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { COMMODITY_CATEGORIES } from "../data/commodities";
import { COMPANY, buildWhatsAppLink } from "../data/company";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const initialForm = {
  name: "", company: "", email: "", phone: "",
  country: "", commodity: "", quantity: "",
  destination: "", message: "",
};

export default function Contact() {
  const ref = useReveal([]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please provide your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/inquiries`, { ...form, source: "contact_page" });
      setSubmitted(true);
      toast.success("Inquiry received", {
        description: "Our trade desk will respond within one business day.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not submit inquiry", {
        description: "Please try again or reach us on WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main ref={ref} data-testid="contact-page">
      <PageHeader
        eyebrow="Contact"
        title="Speak to our trade desk."
        subtitle="Share your requirement — our team responds within one business day. For urgent inquiries, reach us directly on WhatsApp."
      />

      <section className="bg-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Contact info */}
          <aside className="lg:col-span-4 sn-reveal">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
              Head Office
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-[#0A192F] leading-tight">
              Hyderabad, India
            </h2>

            <div className="mt-8 space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 bg-[#0A192F] text-white inline-flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-display font-semibold text-slate-500">Address</p>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {COMPANY.address.line1},<br />
                    {COMPANY.address.line2},<br />
                    {COMPANY.address.country}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 bg-[#0A192F] text-white inline-flex items-center justify-center flex-shrink-0">
                  <Mail size={16} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-display font-semibold text-slate-500">Email</p>
                  <a href={`mailto:${COMPANY.email}`} data-testid="contact-email" className="mt-1 block text-slate-700 hover:text-[#2563EB]">
                    {COMPANY.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 bg-[#0A192F] text-white inline-flex items-center justify-center flex-shrink-0">
                  <Phone size={16} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-display font-semibold text-slate-500">Phone</p>
                  <a href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`} data-testid="contact-phone" className="mt-1 block text-slate-700 hover:text-[#2563EB]">
                    {COMPANY.phone}
                  </a>
                </div>
              </div>
            </div>

            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="contact-whatsapp-btn"
              className="mt-10 inline-flex items-center gap-2 h-12 px-5 bg-[#25D366] text-white text-sm font-medium hover:brightness-95 transition"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </aside>

          {/* Form */}
          <div className="lg:col-span-8 sn-reveal sn-delay-1">
            {submitted ? (
              <div className="bg-[#F8FAFC] border border-slate-200 p-10 md:p-14 text-center" data-testid="contact-thankyou">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-emerald-600" size={28} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-[#0A192F]">
                  Thank you — your inquiry is received.
                </h3>
                <p className="text-slate-600 text-base mt-3 max-w-md mx-auto leading-relaxed">
                  Our trade desk will contact you shortly. For urgent requirements, reach us directly on WhatsApp.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={buildWhatsAppLink(form.commodity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="contact-thankyou-whatsapp"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-[#25D366] text-white text-sm font-medium hover:brightness-95 transition"
                  >
                    <MessageCircle size={16} /> Continue on WhatsApp
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none border-slate-300 h-11"
                    onClick={() => { setForm(initialForm); setSubmitted(false); }}
                    data-testid="contact-new-inquiry"
                  >
                    New inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="bg-white border border-slate-200 p-6 md:p-10 space-y-5"
                data-testid="contact-form"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Name *">
                    <Input required value={form.name} onChange={update("name")} placeholder="Your full name" data-testid="contact-input-name" className="rounded-none h-11 border-slate-300" />
                  </Field>
                  <Field label="Company Name">
                    <Input value={form.company} onChange={update("company")} placeholder="Company" data-testid="contact-input-company" className="rounded-none h-11 border-slate-300" />
                  </Field>
                  <Field label="Email *">
                    <Input required type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" data-testid="contact-input-email" className="rounded-none h-11 border-slate-300" />
                  </Field>
                  <Field label="Phone / WhatsApp">
                    <Input value={form.phone} onChange={update("phone")} placeholder="+00 000 000 0000" data-testid="contact-input-phone" className="rounded-none h-11 border-slate-300" />
                  </Field>
                  <Field label="Country">
                    <Input value={form.country} onChange={update("country")} placeholder="Country" data-testid="contact-input-country" className="rounded-none h-11 border-slate-300" />
                  </Field>
                  <Field label="Commodity of Interest">
                    <Select value={form.commodity} onValueChange={(v) => setForm((f) => ({ ...f, commodity: v }))}>
                      <SelectTrigger className="rounded-none h-11 border-slate-300" data-testid="contact-select-commodity">
                        <SelectValue placeholder="Select a commodity" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMODITY_CATEGORIES.map((cat) => (
                          <React.Fragment key={cat.slug}>
                            <SelectItem value={cat.title} className="font-semibold">{cat.title} — All</SelectItem>
                            {cat.items.map((item) => (
                              <SelectItem key={`${cat.slug}-${item.name}`} value={item.name}>
                                &nbsp;&nbsp;{item.name}
                              </SelectItem>
                            ))}
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Quantity">
                    <Input value={form.quantity} onChange={update("quantity")} placeholder="e.g., 2000 MT" data-testid="contact-input-quantity" className="rounded-none h-11 border-slate-300" />
                  </Field>
                  <Field label="Delivery Destination">
                    <Input value={form.destination} onChange={update("destination")} placeholder="Port / City / Country" data-testid="contact-input-destination" className="rounded-none h-11 border-slate-300" />
                  </Field>
                </div>
                <Field label="Message">
                  <Textarea rows={5} value={form.message} onChange={update("message")} placeholder="Specifications, delivery window, any additional details…" data-testid="contact-input-message" className="rounded-none border-slate-300" />
                </Field>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={submitting}
                    data-testid="contact-submit-btn"
                    className="rounded-none bg-[#0A192F] hover:bg-[#2563EB] text-white h-12 px-8 flex-1 transition-colors"
                  >
                    {submitting ? (<><Loader2 size={16} className="mr-2 animate-spin" /> Sending…</>) : "Submit Inquiry"}
                  </Button>
                  <a
                    href={buildWhatsAppLink(form.commodity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="contact-form-whatsapp"
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#25D366] text-white text-sm font-medium hover:brightness-95 transition"
                  >
                    <MessageCircle size={16} /> WhatsApp Desk
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  By submitting you agree to be contacted by {COMPANY.shortName}.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-[0.12em] font-semibold text-slate-600 font-display">
        {label}
      </Label>
      {children}
    </div>
  );
}
