type SectionDividerProps = {
  className?: string;
};

function DividerLine() {
  return (
    <div className="relative h-px w-full bg-gradient-to-r from-transparent via-[#e3bf70] to-transparent">
      <div className="pointer-events-none absolute inset-0 shadow-[0_0_14px_rgba(227,191,112,0.65)]" />
    </div>
  );
}

export default function SectionDivider({ className }: SectionDividerProps) {
  const rootClassName = className ?? "";

  return (
    <div aria-hidden="true" className={rootClassName}>
      <DividerLine />
    </div>
  );
}
