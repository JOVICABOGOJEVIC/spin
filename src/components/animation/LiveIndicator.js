import { motion } from "framer-motion";

const LiveIndicator = () => {
  return (
    <div className="flex items-center p-2 float-right">
      <motion.div
        className="h-3 w-3 bg-red-500 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="ml-2 text-sm font-semibold text-red-500">LIVE</span>
    </div>
  );
};

export default LiveIndicator;