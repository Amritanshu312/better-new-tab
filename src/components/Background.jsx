import { useVideo } from "../context/VideoContext";

const Background = () => {
  const { videoURL } = useVideo();

  return (
    <div className="relative">
      <video
        src={videoURL || "/assets/samurai-spirit-under-the-moon.3840x2160.mp4"}
        className="w-full h-screen object-cover fixed top-0 left-0"
        muted
        autoPlay
        loop
      ></video>

      <div className="bg-[#0000007e] w-full h-full fixed top-0 left-0"></div>
    </div>
  );
};

export default Background;
