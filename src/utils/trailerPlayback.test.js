import { resolveTrailerPlaybackSource } from "./trailerPlayback";

describe("resolveTrailerPlaybackSource", () => {
  it("uses the signed Cloudflare token as the iframe path", () => {
    const source = resolveTrailerPlaybackSource(
      {
        playbackToken: "signed.jwt.token",
        videoId: "cloudflare-video-id",
      },
      null,
    );

    const url = new URL(source.src);

    expect(source.type).toBe("iframe");
    expect(url.origin).toBe("https://iframe.videodelivery.net");
    expect(url.pathname).toBe("/signed.jwt.token");
    expect(url.searchParams.get("token")).toBeNull();
    expect(url.searchParams.get("controls")).toBe("true");
  });

  it("keeps old direct Cloudflare iframe URLs playable", () => {
    const source = resolveTrailerPlaybackSource(null, {
      trailerUrl: "https://iframe.videodelivery.net/direct-video-id",
    });

    const url = new URL(source.src);

    expect(source.type).toBe("iframe");
    expect(url.pathname).toBe("/direct-video-id");
    expect(url.searchParams.get("controls")).toBe("true");
  });
});
