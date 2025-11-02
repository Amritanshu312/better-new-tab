import { useGeneralSettings } from "../context/GeneralSettings";
import { useVideo } from "../context/VideoContext";

const Background = () => {
  const { videoURL, loadingVideo } = useVideo();
  const { settings } = useGeneralSettings()

  if (loadingVideo) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#000000] text-white"></div>
    );
  }


  return (
    <div className="relative">
      <video
        src={videoURL || "/assets/samurai-spirit-under-the-moon.3840x2160.mp4"}
        className="w-full h-screen object-cover fixed top-0 left-0"
        muted
        autoPlay
        loop
      ></video>

      {settings.showBackground ? <div className="bg-[#000000] w-full h-full fixed top-0 left-0" style={{ opacity: `${settings.wallpaperDimming}%` }}></div> : null}
      {/* {showBackground ? <div className="bg-[#0000007e] w-full h-full fixed top-0 left-0"></div> : null} */}
    </div>
  );
};

export default Background;
