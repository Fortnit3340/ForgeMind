
// Optional Cloudflare Worker adapter.
// ForgeMind desktop does NOT require this worker.
// If you later want shared auth/verification, deploy your own worker
// and configure the app to use it. Never put an AI provider master key
// into a public client application.
export default {
  async fetch(request) {
    return new Response(JSON.stringify({
      ok: true,
      service: "ForgeMind optional adapter",
      note: "No master AI key is stored here."
    }), {headers: {"content-type":"application/json"}});
  }
}
