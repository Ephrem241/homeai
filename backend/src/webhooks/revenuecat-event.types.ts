// Plain interface (not a class) on purpose — the global ValidationPipe's
// `whitelist: true` only strips fields off class-validator DTO classes, and
// this payload has many fields we don't use; typing it as an interface lets
// the full body through untouched to this handler.
export interface RevenueCatWebhookPayload {
  event: {
    type: string;
    app_user_id: string;
    entitlement_ids?: string[];
    id: string;
  };
}
