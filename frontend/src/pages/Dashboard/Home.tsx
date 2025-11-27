import Lottie from "lottie-react";
import dashboardAnimation from "../../../public/animations/DahsBoard_animation.json";

export default function DashboardIntro() {
  return (
    // <div className="flex justify-center items-center w-full h-[calc(100vh-120px)] overflow-hidden ">
    <div className="flex justify-center items-center w-full h-[calc(100vh-120px)] overflow-hidden bg-blue-100 dark:bg-transparent transition-colors duration-300">
      <div className="w-[70vw] max-w-[1000px]">
        <Lottie animationData={dashboardAnimation} loop={true} />
      </div>
    </div>
  );
}
