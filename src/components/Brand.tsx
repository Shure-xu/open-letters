type BrandProps = {
  href?: string;
};

export function Brand({ href = "#top" }: BrandProps) {
  return (
    <a href={href} className="brand" data-od-id="brand-logo">
      open letters<span className="dot">.</span>
    </a>
  );
}
