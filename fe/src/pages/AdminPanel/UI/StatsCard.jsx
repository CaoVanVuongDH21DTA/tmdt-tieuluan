const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-gray-900 mb-1">{value}</h4>
      </div>
    </div>
  );
};

export default StatsCard;