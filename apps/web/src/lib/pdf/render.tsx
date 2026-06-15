import { renderToBuffer } from "@react-pdf/renderer";
import type { FormField, FormResponse } from "@kaemform/shared";
import { ResponsesDocument, type ResponsesDocumentLabels } from "./ResponsesDocument";

export interface RenderResponsesPdfArgs {
  title: string;
  exportedAt: string;
  fields: FormField[];
  responses: FormResponse[];
  labels: ResponsesDocumentLabels;
}

export function renderResponsesPdf(args: RenderResponsesPdfArgs): Promise<Buffer> {
  return renderToBuffer(<ResponsesDocument {...args} />);
}
