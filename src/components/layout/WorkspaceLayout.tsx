import React from "react";

type Props = {
  children: React.ReactNode;
};

export function WorkspaceLayout({ children }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-12">
      {children}
    </div>
  );
}
