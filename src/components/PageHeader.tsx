import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  extra?: ReactNode;
}

export function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {extra ? <div className="page-header-extra">{extra}</div> : null}
    </div>
  );
}
