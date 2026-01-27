import { Check } from '@mui/icons-material';

const Timeline = ({ stepCount }) => {
  // Định nghĩa các bước khớp với logic getStepCount
  const steps = [
    { label: "Đặt hàng", sub: "Chờ xác nhận" },   // Step 1
    { label: "Đã xác nhận", sub: "Đang chuẩn bị" }, // Step 2
    { label: "Đang giao", sub: "Giao cho ĐVVC" },   // Step 3
    { label: "Hoàn thành", sub: "Đã nhận hàng" }, // Step 4
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative w-full">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full"></div>
        <div 
            className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-500 ease-in-out"
            style={{ 
                width: stepCount === 0 ? '0%' : `${((stepCount - 1) / (steps.length - 1)) * 100}%` 
            }}
        ></div>

        {steps.map((step, idx) => {
          const stepIndex = idx + 1;
          const isCompleted = stepCount > stepIndex; 
          const isCurrent = stepCount === stepIndex; 

          return (
            <div key={idx} className="flex flex-col items-center relative group">
              
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white
                  ${isCompleted 
                    ? "border-green-500 bg-green-500 text-white shadow-md scale-110"
                    : isCurrent 
                      ? "border-blue-600 text-blue-600 ring-4 ring-blue-100 scale-110"
                      : "border-gray-300 text-gray-300" 
                  }
                `}
              >
                {isCompleted ? (
                  <Check fontSize="small" className="md:w-6 md:h-6 w-4 h-4" />
                ) : (
                  <span className="text-xs md:text-sm font-bold">{idx + 1}</span>
                )}
              </div>

              <div className={`absolute top-12 md:top-14 w-32 text-center transition-colors duration-300
                  ${isCompleted ? "text-green-600" : isCurrent ? "text-blue-700" : "text-gray-400"}
              `}>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                  {step.label}
                </p>
                <p className="text-[9px] md:text-[10px] font-medium opacity-80 hidden md:block">
                  {step.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="h-12 md:h-16"></div>
    </div>
  );
};

export default Timeline;