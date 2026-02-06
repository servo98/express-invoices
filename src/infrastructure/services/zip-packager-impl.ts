import JSZip from "jszip";
import type { ZipPackager } from "@/domain/ports/services";

export class ZipPackagerImpl implements ZipPackager {
  async createBundle(files: { name: string; data: Buffer | string }[]): Promise<Buffer> {
    const zip = new JSZip();

    for (const file of files) {
      zip.file(file.name, file.data);
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    return Buffer.from(buffer);
  }
}
