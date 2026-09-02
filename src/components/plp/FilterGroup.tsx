"use client";

import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import type { AttributeKey, FacetCounts, FilterGroupDef, FilterOption } from '@/types/plp';
import { CURRENCY_SYMBOL } from '@/filters';

/**
 * One collapsible filter group, rendered from its definition.
 *
 * Every control type the config can name lives here — `chips`, `swatches`,
 * `list`, `price` — so the panel never branches on a specific facet and a new
 * group is a config entry, not a component.
 *
 * Options that would return nothing are disabled rather than hidden: a shopper
 * can see that Size exists and that nothing in this result set is tagged with
 * one, which is the honest signal. It also means the group lights up on its own
 * the moment real inventory attributes land.
 */

function GroupShell({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border-b border-black/[0.06] pb-6 mb-6 last:mb-0 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="type-label mb-4 flex w-full items-center justify-between text-[#1A1A1A] transition-colors duration-200 ease-out hover:text-accent-ink"
      >
        {label}
        <ChevronDown
          aria-hidden
          size={13}
          strokeWidth={2}
          className={`text-neutral-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OptionProps {
  option: FilterOption;
  active: boolean;
  count: number;
  onToggle: () => void;
}

/** Compact pill — sizes, age ranges. Carries the age hint beneath the label. */
function ChipOption({ option, active, count, onToggle }: OptionProps) {
  const unavailable = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={unavailable}
      aria-pressed={active}
      title={unavailable ? `No products currently tagged ${option.label}` : undefined}
      className={`flex flex-col items-center justify-center rounded-[4px] border px-2 py-2 text-center transition-[background-color,border-color,color] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-accent bg-accent text-accent-on'
          : 'border-neutral-200 bg-white text-neutral-600 hover:border-accent hover:text-accent-ink'
      }`}
    >
      <span className="text-[11px] font-semibold tracking-[0.04em]">{option.label}</span>
      {option.hint && (
        <span className={`mt-0.5 text-[9px] leading-tight ${active ? 'text-white/70' : 'text-neutral-400'}`}>
          {option.hint}
        </span>
      )}
    </button>
  );
}

/** Checkbox row — fits, categories, themes, fabrics, gender. Shows its count. */
function ListOption({ option, active, count, onToggle }: OptionProps) {
  const unavailable = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={unavailable}
      aria-pressed={active}
      className="group/opt flex w-full items-center gap-3 py-1.5 text-left transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        aria-hidden
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-[background-color,border-color] duration-200 ease-out ${
          active
            ? 'border-accent bg-accent'
            : 'border-neutral-300 bg-white group-hover/opt:border-accent'
        }`}
      >
        {active && <Check size={12} strokeWidth={3} className="text-white" />}
      </span>
      <span
        className={`flex-1 text-[13px] transition-colors duration-200 ease-out ${
          active ? 'font-medium text-[#1A1A1A]' : 'text-neutral-600 group-hover/opt:text-[#1A1A1A]'
        }`}
      >
        {option.label}
      </span>
      <span className="text-[11px] tabular-nums text-neutral-400">{count}</span>
    </button>
  );
}

/** Colour swatch with its name beneath — shared by the panel and the Kids rail. */
function SwatchOption({ option, active, count, onToggle }: OptionProps) {
  const unavailable = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={unavailable}
      aria-pressed={active}
      aria-label={option.label}
      title={unavailable ? `No products currently tagged ${option.label}` : option.label}
      className="group/sw flex w-[52px] flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        aria-hidden
        style={{ background: option.swatch }}
        className={`h-8 w-8 rounded-full transition-[transform,box-shadow] duration-200 ease-out group-hover/sw:scale-105 ${
          option.swatchBordered ? 'ring-1 ring-inset ring-black/10' : ''
        } ${
          active
            ? 'shadow-[0_0_0_2px_#FFFFFF,0_0_0_4px_var(--accent-900)]'
            : 'shadow-[0_1px_4px_rgba(20,20,25,0.14)]'
        }`}
      />
      <span
        className={`w-full truncate text-center text-[10px] leading-tight transition-colors ${
          active ? 'font-semibold text-accent-ink' : 'text-neutral-500'
        }`}
      >
        {option.label}
      </span>
    </button>
  );
}

/** Min / max inputs, debounced by the panel that owns them. */
function PriceControl({
  min,
  max,
  onChange,
}: {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  const parse = (raw: string) => (raw.trim() === '' ? null : Math.max(0, Number(raw)));

  return (
    <div className="flex items-center gap-2">
      {([
        ['Min', min, (v: number | null) => onChange(v, max)],
        ['Max', max, (v: number | null) => onChange(min, v)],
      ] as const).map(([label, value, set], i) => (
        <div key={label} className="contents">
          {i === 1 && <span aria-hidden className="text-[10px] text-neutral-300">—</span>}
          <div className="relative flex-1">
            <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
              {CURRENCY_SYMBOL}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              aria-label={`${label} price`}
              placeholder={label}
              value={value ?? ''}
              onChange={(e) => set(parse(e.target.value))}
              className="w-full rounded-[4px] border border-neutral-200 bg-white py-2 pl-7 pr-3 text-[12px] font-medium text-[#1A1A1A] transition-colors duration-200 placeholder:font-normal placeholder:text-neutral-400 focus:border-accent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FilterGroup({
  group,
  counts,
  isActive,
  onToggle,
  price,
  onPriceChange,
}: {
  group: FilterGroupDef;
  counts: FacetCounts;
  isActive: (key: AttributeKey, value: string) => boolean;
  onToggle: (key: AttributeKey, value: string) => void;
  price: { min: number | null; max: number | null };
  onPriceChange: (min: number | null, max: number | null) => void;
}) {
  if (group.control === 'price') {
    return (
      <GroupShell label={group.label} defaultOpen={group.defaultOpen}>
        <PriceControl min={price.min} max={price.max} onChange={onPriceChange} />
      </GroupShell>
    );
  }

  const key = group.attribute;
  const options = group.options ?? [];
  if (!key || !options.length) return null;

  const optionProps = (option: FilterOption): OptionProps => ({
    option,
    active: isActive(key, option.value),
    count: counts[`${key}:${option.value}`] ?? 0,
    onToggle: () => onToggle(key, option.value),
  });

  return (
    <GroupShell label={group.label} defaultOpen={group.defaultOpen}>
      {group.control === 'chips' && (
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => (
            <ChipOption key={option.value} {...optionProps(option)} />
          ))}
        </div>
      )}

      {group.control === 'swatches' && (
        <div className="flex flex-wrap gap-x-3 gap-y-4">
          {options.map((option) => (
            <SwatchOption key={option.value} {...optionProps(option)} />
          ))}
        </div>
      )}

      {group.control === 'list' && (
        <div className="flex flex-col">
          {options.map((option) => (
            <ListOption key={option.value} {...optionProps(option)} />
          ))}
        </div>
      )}
    </GroupShell>
  );
}
