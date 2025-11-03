import { useEffect, useRef } from "react";
import { useGeneralSettings } from "../context/GeneralSettings";
import { useVideo } from "../context/VideoContext";

const Background = () => {
  const videoRef = useRef(null);
  const { videoURL, loadingVideo } = useVideo();
  const { settings } = useGeneralSettings();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = settings.playbackRate || 1;
      console.log(settings.playbackRate)
    }
  }, [settings, videoRef, videoURL]);

  if (loadingVideo) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        Loading video...
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoURL || "/assets/samurai-spirit-under-the-moon.3840x2160.mp4"}
        className="w-full h-screen object-cover fixed top-0 left-0"
        muted
        autoPlay
        loop
        preload="auto"
      ></video>

      {settings.showBackground && (
        <div
          className="bg-black w-full h-full fixed top-0 left-0"
          style={{ opacity: `${settings.wallpaperDimming}%` }}
        ></div>
      )}
    </div>
  );
};

export default Background;
