export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/invoices/:path*",
    "/settings/:path*",
    "/api/invoices/:path*",
  ],
};
