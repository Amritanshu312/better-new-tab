import { useEffect, useRef } from "react";
import { useGeneralSettings } from "../context/GeneralSettings";
import { useVideo } from "../context/VideoContext";

const Background = () => {
  const videoRef = useRef(null);
  const { mediaURL, mediaType, loadingMedia } = useVideo();
  const { settings } = useGeneralSettings();

  useEffect(() => {
    // Set playback rate only if media is video
    if (mediaType === "video" && videoRef.current) {
      videoRef.current.playbackRate = settings.playbackRate || 1;
    }
  }, [settings.playbackRate, mediaType, mediaURL]);

  if (loadingMedia) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        Loading wallpaper...
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 🎞️ Video background */}
      {mediaType === "video" ? (
        <video
          ref={videoRef}
          src={mediaURL || "/assets/samurai-spirit-under-the-moon.3840x2160.mp4"}
          className="w-full h-screen object-cover fixed top-0 left-0"
          muted
          autoPlay
          loop
          preload="auto"
        ></video>
      ) : mediaType === "image" ? (
        /* 🖼️ Image background */
        <img
          src={mediaURL}
          alt="Wallpaper"
          className="w-full h-screen object-cover fixed top-0 left-0"
          draggable={false}
        />
      ) : (
        /* 🕹️ Default fallback video */
        <video
          ref={videoRef}
          src="/assets/samurai-spirit-under-the-moon.3840x2160.mp4"
          className="w-full h-screen object-cover fixed top-0 left-0"
          muted
          autoPlay
          loop
          preload="auto"
        ></video>
      )}

      {/* 🌓 Dimming Overlay */}
      {settings.showBackground && (
        <div
          className="bg-black w-full h-full fixed top-0 left-0 pointer-events-none"
          style={{ opacity: `${settings.wallpaperDimming}%` }}
        ></div>
      )}
    </div>
  );
};

export default Background;
