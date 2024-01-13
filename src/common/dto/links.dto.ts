import { Request } from 'express';

export class LinksMetadata {
  self: string | null;
  next: string | null;
  last: string | null;

  constructor(req: Request, offset: number, limit: number, total: number) {
    const url = new URL(
      `${req.protocol}://${req.get('Host')}${req.originalUrl}`,
    );

    url.searchParams.set('offset', `${Math.min(offset + limit, total)}`);
    const next = url.toString();
    url.searchParams.set('offset', `${Math.max(0, offset - limit)}`);
    const last = url.toString();

    this.self = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
    this.next = decodeURIComponent(next);
    this.last = decodeURIComponent(last);
  }
}
