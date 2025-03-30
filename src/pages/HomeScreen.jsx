import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [glitters, setGlitters] = useState([]);

  useEffect(() => {
    // Hide the intro after 3 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    // Generate random positions for glitters
    const numGlitters = 100;
    const newGlitters = Array.from({ length: numGlitters }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      animationDuration: Math.random() * 5 + 3 + "s",
      delay: Math.random() * 5 + "s",
    }));
    setGlitters(newGlitters);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center relative overflow-hidden bg-black">
      {/* Intro Animation */}
      {showIntro ? (
        <div className="absolute w-full h-full flex justify-center items-center bg-black z-50 animate-fade duration-600 ease-in-out ">
          <h1 className="text-white text-6xl font-bold animate-slideIn">WorkChain</h1>
        </div>
      ) : (
        <>
          {/* Background Image */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <img
              src={"img/bgImg.png"}
              alt=""
              className="h-full w-full object-cover opacity-20"
            />
          </div>

          {/* Glittering Dots */}
          {glitters.map((dot, index) => (
            <div
              key={index}
              className="absolute rounded-full opacity-80 animate-glitter"
              style={{
                top: `${dot.top}%`,
                left: `${dot.left}%`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                backgroundColor: "white",
                filter: "blur(1px)",
                animationDuration: dot.animationDuration,
                animationDelay: dot.delay,
              }}
            ></div>
          ))}

          {/* Main Content */}
          <div className="flex flex-col justify-center z-10 bg-white/5 backdrop-blur-md p-10 rounded-lg">
            <h1 className="text-white text-4xl font-bold z-10">Welcome to the Job Portal</h1>
            <p className="text-white mt-4 z-10">Find your next job or hire a freelancer!</p>

            <div className="flex flex-row gap-4 z-10 pt-10">
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-lg"
                onClick={() => navigate("/freelancer")}
              >
                For Job Seekers
              </button>
              <button
                className="px-6 py-3 bg-green-500 text-white rounded-lg"
                onClick={() => navigate("/client")}
              >
                For Job Givers
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
