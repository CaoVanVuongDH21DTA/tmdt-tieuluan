import AsideSkeleton from "../Skeleton/AsideSkeleton";

const MetaDataFilter = ({ title, data = [], selectedValues = [], onChange, loading = false }) => {
  const handleCheckboxChange = (value, checked) => {
    let newSelected;
    if (checked) {
      newSelected = [...selectedValues, value.name];
    } else {
      newSelected = selectedValues.filter((v) => v !== value.name);
    }
    onChange(newSelected);
  };

  if (loading) {
    return <AsideSkeleton />;
  }

  return (
    <div className="mt-5">
      <p className="text-[16px] text-black">{title}</p>
      <div className="flex flex-col gap-2 mt-2">
        {data.map((value, index) => (
          <label key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={value.id}
              checked={selectedValues.includes(value.name)}
              onChange={(e) => handleCheckboxChange(value, e.target.checked)}
            />
            <span>{value.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MetaDataFilter;
