import { useEffect, useState } from "react";

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 7); 

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden text-gray-900 bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 animate-bounce">🚀 Coming Soon</h1>
        <p className="text-lg mb-6">We’re working hard to launch something awesome.</p>

        {/* Countdown */}
        <div className="text-2xl font-mono mb-8">
          {timeLeft.days ?? 0}d {timeLeft.hours ?? 0}h {timeLeft.minutes ?? 0}m {timeLeft.seconds ?? 0}s
        </div>

        {/* Funny message */}
        <p className="italic">Tip: refresh the page… it won’t be ready anyway 😉</p>
      </div>
    </div>
  );
}