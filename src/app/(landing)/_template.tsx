// @ts-expect-error - unstable_ViewTransition exists in React 19.1+ but types may lag
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return <ViewTransition name="page">{children}</ViewTransition>;
}
