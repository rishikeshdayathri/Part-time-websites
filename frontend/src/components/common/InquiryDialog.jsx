import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ALL_COMMODITIES, COMMODITY_CATEGORIES } from "../../data/commodities";
import { buildWhatsAppLink, COMPANY } from "../../data/company";
import { Loader2, MessageCircle, CheckCircle2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const initialForm = {
  name: "", company: "", email: "", phone: "",
  country: "", commodity: "", quantity: "",
  destination: "", message: "",
};

export default function InquiryDialog({ open, onOpenChange, commodity = "", source = "cta" }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...initialForm, commodity: commodity || "" });
      setSubmitted(false);
    }
  }, [open, commodity]);

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
      await axios.post(`${API}/inquiries`, { ...form, source });
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

  const whatsappUrl = buildWhatsAppLink(form.commodity || commodity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[640px] rounded-none border border-slate-200 p-0 overflow-hidden"
        data-testid="inquiry-dialog"
      >
        <div className="bg-[#0A192F] text-white px-6 md:px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 sn-grid-bg-dark opacity-40 pointer-events-none" />
          <DialogHeader className="relative">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#60A5FA] font-display">
              Trade Desk
            </p>
            <DialogTitle className="font-display text-2xl md:text-3xl font-semibold tracking-tight mt-1 text-white">
              Send a Trade Inquiry
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm mt-1">
              Share your requirement — our team will respond within one business day.
            </DialogDescription>
          </DialogHeader>
        </div>

        {submitted ? (
          <div className="px-6 md:px-8 py-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-emerald-600" size={28} />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#0A192F]">
              Thank you — your inquiry is received.
            </h3>
            <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
              Our trade desk will contact you shortly. For urgent requirements, reach us directly on WhatsApp.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="inquiry-continue-whatsapp-btn"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-[#25D366] text-white text-sm font-medium hover:brightness-95 transition"
              >
                <MessageCircle size={16} /> Continue on WhatsApp
              </a>
              <Button
                type="button"
                variant="outline"
                className="rounded-none border-slate-300 h-11"
                onClick={() => onOpenChange(false)}
                data-testid="inquiry-close-btn"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="px-6 md:px-8 py-6 space-y-4" data-testid="inquiry-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name *">
                <Input required value={form.name} onChange={update("name")} placeholder="Your full name" data-testid="inquiry-input-name" className="rounded-none h-11 border-slate-300" />
              </Field>
              <Field label="Company">
                <Input value={form.company} onChange={update("company")} placeholder="Company name" data-testid="inquiry-input-company" className="rounded-none h-11 border-slate-300" />
              </Field>
              <Field label="Email *">
                <Input required type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" data-testid="inquiry-input-email" className="rounded-none h-11 border-slate-300" />
              </Field>
              <Field label="Phone / WhatsApp">
                <Input value={form.phone} onChange={update("phone")} placeholder="+00 000 000 0000" data-testid="inquiry-input-phone" className="rounded-none h-11 border-slate-300" />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={update("country")} placeholder="Country" data-testid="inquiry-input-country" className="rounded-none h-11 border-slate-300" />
              </Field>
              <Field label="Commodity of Interest">
                <Select value={form.commodity} onValueChange={(v) => setForm((f) => ({ ...f, commodity: v }))}>
                  <SelectTrigger className="rounded-none h-11 border-slate-300" data-testid="inquiry-select-commodity">
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
                <Input value={form.quantity} onChange={update("quantity")} placeholder="e.g., 2000 MT" data-testid="inquiry-input-quantity" className="rounded-none h-11 border-slate-300" />
              </Field>
              <Field label="Delivery Destination">
                <Input value={form.destination} onChange={update("destination")} placeholder="Port / City / Country" data-testid="inquiry-input-destination" className="rounded-none h-11 border-slate-300" />
              </Field>
            </div>
            <Field label="Message">
              <Textarea rows={4} value={form.message} onChange={update("message")} placeholder="Specifications, delivery window, any additional details…" data-testid="inquiry-input-message" className="rounded-none border-slate-300" />
            </Field>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2 mt-2 border-t border-slate-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="inquiry-whatsapp-btn"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-[#25D366] text-white text-sm font-medium hover:brightness-95 transition order-2 sm:order-1"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <Button
                type="submit"
                disabled={submitting}
                data-testid="inquiry-submit-btn"
                className="rounded-none bg-[#0A192F] hover:bg-[#2563EB] text-white h-11 px-6 flex-1 order-1 sm:order-2 transition-colors"
              >
                {submitting ? (<><Loader2 size={16} className="mr-2 animate-spin" /> Sending…</>) : "Submit Inquiry"}
              </Button>
            </DialogFooter>

            <p className="text-[11px] text-slate-500 text-center pt-1">
              By submitting you agree to be contacted by {COMPANY.shortName}.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
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
